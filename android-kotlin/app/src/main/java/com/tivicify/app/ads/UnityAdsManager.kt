package com.tivicify.app.ads

import android.app.Activity
import android.content.Context
import android.util.Log
import com.unity3d.ads.IUnityAdsInitializationListener
import com.unity3d.ads.IUnityAdsLoadListener
import com.unity3d.ads.IUnityAdsShowListener
import com.unity3d.ads.UnityAds
import com.unity3d.ads.UnityAdsShowOptions

object UnityAdsManager {
    private const val TAG = "TivicifyUnityAds"
    var defaultGameId = "5432101"
    var defaultAdUnitId = "Interstitial_Android"
    var isInitialized = false
        private set

    private var lastAdShowTimeMs: Long = 0L
    private const val MIN_AD_INTERVAL_MS = 4 * 60 * 1000L // 4 minutes

    fun initialize(context: Context, gameId: String = defaultGameId, testMode: Boolean = true) {
        if (isInitialized) return
        defaultGameId = gameId

        UnityAds.initialize(context.applicationContext, gameId, testMode, object : IUnityAdsInitializationListener {
            override fun onInitializationComplete() {
                isInitialized = true
                Log.d(TAG, "Unity Ads successfully initialized with Game ID: $gameId")
                preloadAd(defaultAdUnitId)
            }

            override fun onInitializationFailed(error: UnityAds.UnityAdsInitializationError, message: String) {
                isInitialized = false
                Log.e(TAG, "Unity Ads initialization failed: $error - $message")
            }
        })
    }

    fun preloadAd(adUnitId: String = defaultAdUnitId) {
        if (!isInitialized) return
        UnityAds.load(adUnitId, object : IUnityAdsLoadListener {
            override fun onUnityAdsAdLoaded(placementId: String) {
                Log.d(TAG, "Unity Ad preloaded ready: $placementId")
            }

            override fun onUnityAdsFailedToLoad(placementId: String, error: UnityAds.UnityAdsLoadError, message: String) {
                Log.w(TAG, "Unity Ad preload failed: $placementId - $error - $message")
            }
        })
    }

    fun showAdIfAllowed(
        activity: Activity,
        isPro: Boolean,
        adUnitId: String = defaultAdUnitId,
        onFinished: () -> Unit
    ) {
        // Pro & VIP subscribers NEVER see ads!
        if (isPro) {
            onFinished()
            return
        }

        val now = System.currentTimeMillis()
        if (now - lastAdShowTimeMs < MIN_AD_INTERVAL_MS) {
            onFinished()
            return
        }

        if (!isInitialized) {
            onFinished()
            return
        }

        lastAdShowTimeMs = now
        val options = UnityAdsShowOptions()

        UnityAds.show(activity, adUnitId, options, object : IUnityAdsShowListener {
            override fun onUnityAdsShowStart(placementId: String) {
                Log.d(TAG, "Unity Ad show started: $placementId")
            }

            override fun onUnityAdsShowClick(placementId: String) {
                Log.d(TAG, "Unity Ad clicked: $placementId")
            }

            override fun onUnityAdsShowComplete(placementId: String, state: UnityAds.UnityAdsShowCompletionState) {
                Log.d(TAG, "Unity Ad show complete: $placementId ($state)")
                preloadAd(adUnitId)
                activity.runOnUiThread {
                    onFinished()
                }
            }

            override fun onUnityAdsShowFailure(placementId: String, error: UnityAds.UnityAdsShowError, message: String) {
                Log.w(TAG, "Unity Ad show failed: $placementId - $error - $message")
                preloadAd(adUnitId)
                activity.runOnUiThread {
                    onFinished()
                }
            }
        })
    }
}
