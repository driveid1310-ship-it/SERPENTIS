# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# SERPENTIS native bridge
-keep class com.serpentis.app.SerpentisConfigModule { *; }
-keep class com.serpentis.app.SerpentisConfigPackage { *; }

# MapLibre & OkHttp
-dontwarn org.maplibre.**
-keep class org.maplibre.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**

# Keychain / Reanimated / Worklets
-keep class com.oblador.keychain.** { *; }
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.worklets.** { *; }
