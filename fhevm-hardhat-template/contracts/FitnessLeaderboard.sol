// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FitnessLeaderboard
/// @notice Encrypted fitness aggregation using FHEVM. Stores only encrypted totals and latest user metrics.
/// @dev Uses FHE ops: add/sub/mul/div/lt/gte/select/fromExternal/allow/allowThis
contract FitnessLeaderboard is ZamaEthereumConfig {
    // Global encrypted aggregates
    euint32 private _totalSteps;
    euint32 private _totalMinutes;
    euint32 private _totalCalories;
    uint32 public participantCount; // Plaintext user count (public participation)

    // Latest per-user encrypted snapshot: [steps, minutes, calories]
    mapping(address => euint32[3]) private _userLatest;
    mapping(address => bool) private _hasSubmitted; // participation flag (non-secret)

    // User's total aggregated data: [steps, minutes, calories]
    mapping(address => euint32[3]) private _userTotals;
    mapping(address => uint256) private _userSubmissionCount; // public count of submissions
    
    // User's badge states: [marathoner, centurion, calorieKing, committed, consistent]
    mapping(address => ebool[5]) private _userBadges;

    // Distribution buckets for steps, minutes, calories
    uint8 public constant NUM_BUCKETS = 5;
    euint32[NUM_BUCKETS] private _stepBuckets;
    euint32[NUM_BUCKETS] private _minuteBuckets;
    euint32[NUM_BUCKETS] private _calorieBuckets;
    
    // Step thresholds: [0-2K, 2K-5K, 5K-10K, 10K-20K, 20K+]
    uint32[NUM_BUCKETS] public stepThresholds;
    // Minute thresholds: [0-30, 30-60, 60-90, 90-120, 120+]
    uint32[NUM_BUCKETS] public minuteThresholds;
    // Calorie thresholds: [0-200, 200-400, 400-600, 600-800, 800+]
    uint32[NUM_BUCKETS] public calorieThresholds;

    constructor() {
        stepThresholds[0] = 2000;
        stepThresholds[1] = 5000;
        stepThresholds[2] = 10000;
        stepThresholds[3] = 20000;
        stepThresholds[4] = type(uint32).max;
        
        minuteThresholds[0] = 30;
        minuteThresholds[1] = 60;
        minuteThresholds[2] = 90;
        minuteThresholds[3] = 120;
        minuteThresholds[4] = type(uint32).max;
        
        calorieThresholds[0] = 200;
        calorieThresholds[1] = 400;
        calorieThresholds[2] = 600;
        calorieThresholds[3] = 800;
        calorieThresholds[4] = type(uint32).max;
    }

    /// @notice Assign a value to buckets and authorize decryption
    function _assignToBuckets(
        euint32 value,
        euint32[NUM_BUCKETS] storage buckets,
        uint32[NUM_BUCKETS] storage thresholds,
        address sender
    ) private {
        for (uint8 i = 0; i < NUM_BUCKETS; i++) {
            bool isFirst = (i == 0);
            bool isLast = (i == NUM_BUCKETS - 1);
            ebool isInBucket;
            
            if (isFirst) {
                isInBucket = FHE.lt(value, thresholds[i]);
            } else if (isLast) {
                isInBucket = FHE.ge(value, thresholds[i-1]);
            } else {
                ebool geLower = FHE.ge(value, thresholds[i-1]);
                ebool ltUpper = FHE.lt(value, thresholds[i]);
                isInBucket = FHE.and(geLower, ltUpper);
            }
            
            euint32 increment = FHE.select(isInBucket, FHE.asEuint32(1), FHE.asEuint32(0));
            buckets[i] = FHE.add(buckets[i], increment);
            
            // Allow buckets for sender to decrypt (for UI display)
            FHE.allowThis(buckets[i]);
            FHE.allow(buckets[i], sender);
        }
    }

    /// @notice Submit encrypted activity metrics for the sender
    /// @param steps Encoded external encrypted steps
    /// @param stepsProof Input proof for steps
    /// @param activityMinutes Encoded external encrypted minutes
    /// @param activityMinutesProof Input proof for minutes
    /// @param calories Encoded external encrypted calories
    /// @param caloriesProof Input proof for calories
    function submitActivity(
        externalEuint32 steps,
        bytes calldata stepsProof,
        externalEuint32 activityMinutes,
        bytes calldata activityMinutesProof,
        externalEuint32 calories,
        bytes calldata caloriesProof
    ) external {
        euint32 encSteps = FHE.fromExternal(steps, stepsProof);
        euint32 encMinutes = FHE.fromExternal(activityMinutes, activityMinutesProof);
        euint32 encCalories = FHE.fromExternal(calories, caloriesProof);

        // Update user snapshot (encrypted)
        _userLatest[msg.sender][0] = encSteps;
        _userLatest[msg.sender][1] = encMinutes;
        _userLatest[msg.sender][2] = encCalories;

        // Update user totals (encrypted add)
        _userTotals[msg.sender][0] = FHE.add(_userTotals[msg.sender][0], encSteps);
        _userTotals[msg.sender][1] = FHE.add(_userTotals[msg.sender][1], encMinutes);
        _userTotals[msg.sender][2] = FHE.add(_userTotals[msg.sender][2], encCalories);

        // Aggregate global totals (encrypted add)
        _totalSteps = FHE.add(_totalSteps, encSteps);
        _totalMinutes = FHE.add(_totalMinutes, encMinutes);
        _totalCalories = FHE.add(_totalCalories, encCalories);

        // Increment participant count (plaintext for public visibility)
        if (!_hasSubmitted[msg.sender]) {
            participantCount++;
            _hasSubmitted[msg.sender] = true;
        }

        // Increment user submission count (public)
        _userSubmissionCount[msg.sender]++;

        // Allow contract and sender to use/decrypt aggregates
        FHE.allowThis(_totalSteps);
        FHE.allowThis(_totalMinutes);
        FHE.allowThis(_totalCalories);
        FHE.allow(_totalSteps, msg.sender);
        FHE.allow(_totalMinutes, msg.sender);
        FHE.allow(_totalCalories, msg.sender);

        // Bucket assignment for steps, minutes, and calories
        _assignToBuckets(encSteps, _stepBuckets, stepThresholds, msg.sender);
        _assignToBuckets(encMinutes, _minuteBuckets, minuteThresholds, msg.sender);
        _assignToBuckets(encCalories, _calorieBuckets, calorieThresholds, msg.sender);

        // Also allow user snapshot and totals for the sender
        FHE.allowThis(_userLatest[msg.sender][0]);
        FHE.allowThis(_userLatest[msg.sender][1]);
        FHE.allowThis(_userLatest[msg.sender][2]);
        FHE.allow(_userLatest[msg.sender][0], msg.sender);
        FHE.allow(_userLatest[msg.sender][1], msg.sender);
        FHE.allow(_userLatest[msg.sender][2], msg.sender);

        FHE.allowThis(_userTotals[msg.sender][0]);
        FHE.allowThis(_userTotals[msg.sender][1]);
        FHE.allowThis(_userTotals[msg.sender][2]);
        FHE.allow(_userTotals[msg.sender][0], msg.sender);
        FHE.allow(_userTotals[msg.sender][1], msg.sender);
        FHE.allow(_userTotals[msg.sender][2], msg.sender);

        // Update user badges (calculated on encrypted data)
        _userBadges[msg.sender][0] = FHE.ge(_userTotals[msg.sender][0], FHE.asEuint32(42195)); // marathoner
        _userBadges[msg.sender][1] = FHE.ge(_userLatest[msg.sender][1], FHE.asEuint32(100)); // centurion
        _userBadges[msg.sender][2] = FHE.ge(_userLatest[msg.sender][2], FHE.asEuint32(1000)); // calorieKing
        _userBadges[msg.sender][3] = FHE.ge(_userTotals[msg.sender][1], FHE.asEuint32(500)); // committed
        _userBadges[msg.sender][4] = _userSubmissionCount[msg.sender] >= 7 ? 
            FHE.asEbool(true) : FHE.asEbool(false); // consistent

        // Allow user to decrypt their badges
        for (uint8 i = 0; i < 5; i++) {
            FHE.allowThis(_userBadges[msg.sender][i]);
            FHE.allow(_userBadges[msg.sender][i], msg.sender);
        }
    }

    /// @notice Get encrypted global totals
    function getGlobalStats()
        external
        view
        returns (euint32 totalSteps, euint32 totalMinutes, euint32 totalCalories)
    {
        return (_totalSteps, _totalMinutes, _totalCalories);
    }

    /// @notice Get the latest encrypted snapshot for a user
    function getUserLatest(address user)
        external
        view
        returns (euint32 steps, euint32 activityMinutes, euint32 calories)
    {
        return (_userLatest[user][0], _userLatest[user][1], _userLatest[user][2]);
    }

    /// @notice Get encrypted step distribution buckets
    function getStepBuckets()
        external
        view
        returns (euint32[NUM_BUCKETS] memory)
    {
        return _stepBuckets;
    }

    /// @notice Get encrypted minute distribution buckets
    function getMinuteBuckets()
        external
        view
        returns (euint32[NUM_BUCKETS] memory)
    {
        return _minuteBuckets;
    }

    /// @notice Get encrypted calorie distribution buckets
    function getCalorieBuckets()
        external
        view
        returns (euint32[NUM_BUCKETS] memory)
    {
        return _calorieBuckets;
    }

    /// @notice Get user's encrypted totals and public submission count
    function getUserStats(address user)
        external
        view
        returns (euint32 steps, euint32 activityMinutes, euint32 calories, uint256 submissionCount)
    {
        return (_userTotals[user][0], _userTotals[user][1], _userTotals[user][2], _userSubmissionCount[user]);
    }

    /// @notice Get user's encrypted badge statuses
    /// Badges are based on total achievements and can be publicly decrypted
    /// Returns: marathoner, centurion, calorieKing, committed, consistent
    function getUserBadges(address user)
        external
        returns (ebool, ebool, ebool, ebool, ebool)
    {
        // Recalculate badges in case they weren't set yet
        ebool marathoner = FHE.ge(_userTotals[user][0], FHE.asEuint32(42195));
        ebool centurion = FHE.ge(_userLatest[user][1], FHE.asEuint32(100));
        ebool calorieKing = FHE.ge(_userLatest[user][2], FHE.asEuint32(1000));
        ebool committed = FHE.ge(_userTotals[user][1], FHE.asEuint32(500));
        ebool consistent = _userSubmissionCount[user] >= 7 ? 
            FHE.asEbool(true) : FHE.asEbool(false);

        // Allow user to decrypt
        FHE.allow(marathoner, msg.sender);
        FHE.allow(centurion, msg.sender);
        FHE.allow(calorieKing, msg.sender);
        FHE.allow(committed, msg.sender);
        FHE.allow(consistent, msg.sender);

        return (marathoner, centurion, calorieKing, committed, consistent);
    }
}


