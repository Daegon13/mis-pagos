# Mis Pagos — Android APK Size Audit

Audit date: 2026-10-02. This is a diagnostic snapshot; no build or app configuration was changed.

## Artifact

- Build: EAS build `ae90dec6-0011-4e77-9376-2b4946fe3838`, the finished PREVIEW-01 build recorded in `PROJECT_STATE.md`.
- Local artifact: `application-ae90dec6-0011-4e77-9376-2b4946fe3838.apk` (downloaded artifact in `C:\Users\Usuario\Downloads`; not added to Git).
- Exact file size: **110,399,866 bytes = 110.40 MB = 105.29 MiB**.
- Distribution: internal `preview` profile configured as an APK. The archive includes `arm64-v8a`, `armeabi-v7a`, `x86`, and `x86_64`, so this is a **universal, multi-ABI APK**, not a device-specific APK.
- Inventory method: archive entry compressed and uncompressed lengths from Python's standard ZIP reader. Android SDK `apkanalyzer` confirmed the same file byte count; its detailed summary command could not read the Downloads artifact (`AccessDeniedException`), so the breakdown below uses archive inspection. No APK was extracted into the repository.

## Executive summary

The APK is large primarily because it packages four complete native-library sets. `lib/` alone is **88,548,864 bytes (80.2%)**. The other three ABI copies beyond an `arm64-v8a` set account for **65,291,000 bytes (62.25 MiB; 59.1% of this APK)**. A same-content single-ABI archive would be about **36.1–44.4 MiB**, depending on ABI, as an arithmetic estimate rather than a measured build.

The production JavaScript bundle is **2,320,964 bytes (2.21 MiB; 2.10%)**. Android resources and project images are comparatively small. The most promising dependency candidate is the currently unused `expo-image` direct dependency, whose Android Gradle configuration brings Glide and image-format/animation support; its exact removable APK contribution has not been experimentally measured.

The existing `production` EAS profile already requests an Android App Bundle. Google Play uses an app bundle to generate device-configuration-specific APKs, so it can deliver only the ABI and resources needed by each device. The present universal APK is therefore not a good proxy for future Play download size. [Android App Bundles](https://developer.android.com/guide/app-bundle) [Reducing app size](https://developer.android.com/topic/performance/reduce-apk-size)

## Size composition

Compressed is the sum of compressed ZIP entries; uncompressed is their expanded file length. Percentages use the complete APK file size, including ZIP headers/alignment. The difference between entry compressed totals and APK size is container overhead.

| Area | Compressed bytes | Uncompressed bytes | % APK |
|---|---:|---:|---:|
| `lib/` | 88,548,864 | 88,548,864 | 80.21% |
| `classes*.dex` (4 files) | 15,631,867 | 43,743,088 | 14.16% |
| `assets/` | 2,333,490 | 2,333,977 | 2.11% |
| `resources.arsc` | 1,661,232 | 1,661,232 | 1.50% |
| `res/` | 1,146,229 | 2,010,876 | 1.04% |
| `org/` | 99,399 | 234,637 | 0.09% |
| `okhttp3/` | 37,879 | 37,948 | 0.03% |
| `META-INF/` | 18,844 | 52,073 | 0.02% |
| `kotlin/` | 12,053 | 51,125 | 0.01% |
| `AndroidManifest.xml` | 2,922 | 11,060 | <0.01% |
| Other small entries | 1,064 | 2,359 | <0.01% |
| ZIP container/alignment overhead | 906,023 | — | 0.82% |

The JS bundle is `assets/index.android.bundle`: **2,320,964 bytes compressed and uncompressed** (2.10% of the APK). It includes application JavaScript and bundled JavaScript dependencies; this audit did not split those contributions by module.

All four DEX files together are **15,631,867 compressed bytes** and **43,743,088 uncompressed bytes**. DEX contains application and dependency Java/Kotlin bytecode; archive inspection does not identify an exact per-library contribution. `@expo/ui` is used by the app's date picker and its Android build depends on Jetpack Compose/Material 3, which is one confirmed source of framework bytecode/resources, but the DEX total cannot be assigned wholly to it.

## ABI/native libraries

Every ABI has 24 native `.so` files, stored without ZIP compression in this APK.

| ABI | Native bytes | MiB |
|---|---:|---:|
| `x86_64` | 24,733,680 | 23.59 |
| `x86` | 24,523,588 | 23.39 |
| `arm64-v8a` | 23,257,864 | 22.18 |
| `armeabi-v7a` | 16,033,732 | 15.29 |

The largest native libraries, summed across all four ABIs, are:

| Library | Compressed bytes | Likely source/role |
|---|---:|---|
| `libreactnative.so` | 26,305,072 | React Native runtime |
| `libhermesvm.so` | 9,789,288 | Hermes JavaScript engine |
| `libexpo-sqlite.so` | 6,961,772 | `expo-sqlite` |
| `libreanimated.so` | 5,433,028 | `react-native-reanimated` |
| `libexpo-modules-core.so` | 5,389,156 | Expo Modules Core |
| `libavif_android.so` | 4,696,792 | Native image/AVIF support; likely image dependency stack |
| `libc++_shared.so` | 4,672,844 | Shared Android C++ runtime |
| `libreact_codegen_rnscreens.so` | 4,524,668 | React Native Screens codegen |
| `libworklets.so` | 3,855,888 | React Native Worklets |
| `libappmodules.so` | 3,753,020 | Aggregated generated app modules; not split by Expo package |

The APK contains the full 88.55 MB native set. Relative to keeping only arm64, the other ABI copies add **65,291,000 bytes**. For comparison, subtracting all other ABI entries from this exact archive yields these estimated single-ABI APK totals (no rebuild performed): arm64 **45,108,866 bytes / 43.02 MiB**; armeabi-v7a **37,884,734 / 36.13 MiB**; x86 **46,374,590 / 44.23 MiB**; x86_64 **46,584,682 / 44.43 MiB**. Container layout and Play resource splits can change actual output slightly.

## JavaScript

- Packaged file: `assets/index.android.bundle`.
- Size: **2,320,964 bytes (2.21 MiB)**, stored uncompressed in the APK.
- Share: **2.10%** of the full APK.
- This is the whole production JS bundle, not an isolated count of Mis Pagos source versus npm modules. No bundle analyzer was installed or run.

## Assets

The project `assets/` source files total **1,405,094 bytes**. Largest inputs are:

| Project asset | Source size | Dimensions | Evidence/use |
|---|---:|---:|---|
| `assets/images/icon.png` | 799,005 B | 1024×1024 | Configured app icon |
| `assets/images/logo-glow.png` | 331,624 B | 604×604 | No source/config reference found |
| `assets/images/android-icon-foreground.png` | 78,796 B | 512×512 | Configured adaptive-icon foreground |
| `assets/images/tutorial-web.png` | 58,959 B | 1480×855 | No source/config reference found; web/template-looking |
| `assets/expo.icon/Assets/grid.png` | 53,681 B | 1024×1024 | Part of configured iOS `.expo.icon` asset |

`assets/` inside the APK contains the JS bundle, small app config and baseline profile files, not a large collection of raster images. Android resources (`res/`) total 1,146,229 compressed bytes; that directory mixes application images, framework resources and fonts, so it is not a project-image-only measurement. No source image is individually a meaningful APK-size contributor. The unused-looking Expo/React logos, badges, tutorial image, `logo-glow` and tab images have no references in `src/` or Android app configuration; their removal would save little or nothing from this APK unless confirmed in generated resources. Keep configured app/adaptive icons and splash resources.

## Dependencies

`npm ls --depth=0` completed successfully. Package attribution below combines installed dependency metadata, source/config references and library names; native contribution is not claimed where the artifact cannot identify it.

| Classification | Dependencies/evidence |
|---|---|
| Essential to current product | `expo`, React Native/React, `expo-router` (routes), `expo-sqlite` (persistent financial data), `@expo/ui` (used native `DateTimePicker`), `react-native-safe-area-context`, Screens/Gesture Handler/Reanimated/Worklets for the current navigation/native stack. `expo-splash-screen` is configured. |
| Potentially removable after normal change validation | `expo-image` is a direct dependency only; no source import or app config reference was found. Its Android Gradle file declares Glide, AVIF integration and animation support. Image-related `.so` names in the APK total about **11.13 MB across all four ABIs**, but exact dependency-to-APK attribution and savings require a controlled removal/build comparison. `expo-device` and `expo-web-browser` are also direct-only with no source/config use found; likely smaller and no large library family was isolated for them. |
| Development/web, not expected as Android runtime payload | TypeScript, ESLint and type packages are dev dependencies. `react-dom` and `react-native-web` support web; neither appears as an Android native library. |
| Needs investigation; do not remove from this audit | `expo-status-bar` and `expo-system-ui` lack direct source/config references but may participate in Expo startup integration. `expo-glass-effect` has an empty Android module declaration and is also a dependency of the installed router. `expo-font`, `expo-symbols`, `expo-constants` and `expo-linking` appear in the Expo/router dependency graph. |

Confirmed native/framework payload includes React Native, Hermes, Expo Modules Core, SQLite, Reanimated/Worklets, Screens and supporting C++ runtime. `libappmodules.so` combines generated modules, preventing exact package attribution. `@expo/ui` also brings Compose dependencies; all four DEX files and the resource table include shared application/framework content, so an exact framework-only total cannot be asserted. A defensible measured figure is **88,548,864 bytes of native libraries**, of which only **16.0–24.7 MB** is needed for one ABI, plus **15,631,867 compressed bytes of mixed bytecode**.

## Direct APK vs Play delivery

`preview` is an internal APK profile; `production` in `eas.json` is already configured for an Android App Bundle. The APK's four ABI directories prove it is universal. Google Play processes an AAB and generates APK splits for a device configuration, delivering only required code/resources. [Android App Bundle delivery](https://developer.android.com/guide/app-bundle)

The archive arithmetic supports a **36–44 MiB** single-ABI baseline before any extra Play resource/configuration differences—about **61–69 MiB less** than this universal APK, depending on ABI. This is an estimate from the measured ABI payload, not an exact Play Store download-size prediction; no AAB was built or uploaded. An AAB does not make the universal tester APK smaller. For direct APK sharing, separate ABI APKs are possible but add distribution/compatibility management; Android documents ABI-specific APK generation separately. [Build multiple APKs](https://developer.android.com/build/configure-apk-splits)

Installed size was not measured: `adb.exe` is absent from the Android SDK platform-tools directory and no connected device/emulator was available through this environment. APK download size, expanded archive contents, installed native code and app/SQLite data are distinct measurements. SQLite/user data is not included in this APK size.

## Optimization opportunities

| Candidate | Impact | Risk | Effort | Recommendation |
|---|---|---|---|---|
| Deliver the existing production AAB through Play | HIGH | LOW | LOW | Highest-value planned distribution improvement. Play device targeting avoids shipping the other three ABI sets; measure the actual Play download when an AAB is submitted. |
| Produce ABI-specific APKs for private testers | HIGH | MEDIUM | MEDIUM | Could remove roughly 61–69 MiB per APK by ABI. Do only if the tester device set is known and maintaining several artifacts is acceptable. No config change in SIZE-01. |
| Remove `expo-image` if confirmed unused | MEDIUM | MEDIUM | LOW | Strongest dependency candidate: no application references, and likely image stack is about 11.13 MB across four ABIs. Validate the complete app and compare release artifacts before any future change. |
| Remove other unused direct template-era modules | LOW | MEDIUM | LOW–MEDIUM | Investigate `expo-device` and `expo-web-browser`; no large native contribution was isolated, so savings may be modest. Respect router/runtime transitive dependencies. |
| Remove/optimize unused template images | LOW | LOW | LOW | Fine cleanup, but source assets are only 1.41 MB total and the APK has no large image asset area. Do not expect a meaningful reduction in the current APK. |
| Replace `@expo/ui` or date picker to avoid Compose | MEDIUM | HIGH | HIGH | Leave alone: the app uses the native date picker, Compose contribution was not isolated, and replacing it risks UX/native behavior for uncertain savings. |
| Trim core React Native/Hermes/SQLite or arbitrary native libraries | HIGH | HIGH | HIGH | Leave alone. These underpin current product behavior; savings require architectural/native changes and carry disproportionate regression risk. |

## Product questions and recommendation

1. **Is ~100 MB mainly our app content?** No. Most is framework/dependency native code duplicated for four ABIs.
2. **How much native runtime/framework?** 88,548,864 bytes (80.2%) of native libraries; one ABI needs 16.0–24.7 MB. The 15,631,867 compressed DEX bytes are mixed app and Java/Kotlin dependency code and cannot be apportioned exactly from this archive.
3. **How much multiple architectures?** Four ABIs are present. Beyond arm64, three ABI copies add 65,291,000 bytes (62.25 MiB; 59.1% of the APK).
4. **How large is the actual JS bundle?** 2,320,964 bytes (2.21 MiB; 2.10%), including app and JS dependencies.
5. **Are visual assets significant?** No. Source assets total 1.41 MB; APK `assets/` is mostly the 2.32 MB JS bundle, while all `res/` is 1.15 MB compressed.
6. **Obvious unused dependencies/resources?** `expo-image` is the clearest dependency candidate (direct only, no source/config references); `expo-device` and `expo-web-browser` also have no source/config references. Several template images look unused, but cleanup would have little APK impact. No dependency was removed.
7. **Realistic reduction without product changes?** Rely on AAB device targeting for future Play distribution. For direct downloads, consider ABI-specific APKs; investigate the unused `expo-image` module in a separately validated change.
8. **What should remain untouched?** SQLite, React Native/Hermes, navigation, Reanimated/Worklets and the date picker/Compose stack. Their role is central or their savings/risk tradeoff is unproven. Image cleanup alone is low-value.
9. **Should APK size block PERS-01?** **No.** Personalization can proceed with compact assets and an explicit asset budget; current visual assets are not driving the APK.
10. **Single highest-value optimization?** Use the already-configured AAB path for Play distribution. The measured ABI split indicates around 61–69 MiB of avoidable universal-APK payload per device; verify the actual result with Play/device-specific delivery when available.
