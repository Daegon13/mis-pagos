# Mis Pagos 0.2 Alpha

Prueba privada temprana con un grupo pequeño. Es una alpha: puede tener errores.
Los datos se guardan localmente en tu dispositivo. Desinstalar la app o borrar
sus datos puede eliminar tus datos de prueba. No la uses como tu único registro
financiero.

Instalá el APK compartido mediante el enlace de EAS. No requiere Expo Go ni un
servidor de desarrollo.

[Descargar APK 0.2.0 (2)](https://expo.dev/artifacts/eas/EAiK7PVhMR7RApIqB3eC7DEG-TnHZNLBUxeDEpTWMPU.apk).
Si ya tenés Alpha 0.1, instalá Alpha 0.2 encima sin desinstalar ni borrar datos.

Al probarla, prestá atención a:

- Si Disponible real se entiende de inmediato.
- Si agregar un movimiento resulta fácil.
- Si se entiende la diferencia entre descontar/sumar al pagar/cobrar y elegir
  «Ya está reflejado».
- Si los movimientos vencidos tienen sentido.
- Si algo resulta confuso o tedioso.
- Si Tu espacio genera curiosidad o distrae.
- Si personalizar Tu espacio se siente significativo y reconocible como propio.
- Si elegir un tema resulta útil y los intereses cambian la experiencia.
- Si algún tema dificulta la lectura y si te da curiosidad la evolución futura del espacio.

Para compartir feedback, contanos:

1. Qué esperabas que ocurriera.
2. Qué ocurrió realmente.
3. Qué te confundió.
4. Qué te hubiera gustado que existiera.
5. Si abrirías la app de nuevo por iniciativa propia.

## Versión Android

Alpha privada: `0.2.0`, Android `versionCode: 2`.
Identificador permanente: `com.diegomarin.mispagos`.
Cada futuro build Android debe incrementar `android.versionCode` en `app.json`.
El perfil `preview` genera un APK interno; `production` queda preparado para
un AAB futuro. El APK se distribuye por EAS y no se guarda en Git.
