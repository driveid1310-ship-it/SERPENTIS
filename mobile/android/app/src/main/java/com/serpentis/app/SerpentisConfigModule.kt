package com.serpentis.app

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule

class SerpentisConfigModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "SerpentisConfig"

    override fun getConstants(): Map<String, Any> = mapOf(
        "API_BASE_URL" to BuildConfig.API_BASE_URL,
        "BUILD_TYPE" to BuildConfig.BUILD_TYPE,
        "IS_DEBUG" to BuildConfig.DEBUG,
    )
}
