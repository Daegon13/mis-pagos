# Mis Pagos 0.1 Alpha

Prueba privada temprana con un grupo pequeño. Es una alpha: puede tener errores.
Los datos se guardan localmente en tu dispositivo. Desinstalar la app o borrar
sus datos puede eliminar tus datos de prueba. No la uses como tu único registro
financiero.

Instalá el APK compartido mediante el enlace de EAS. No requiere Expo Go ni un
servidor de desarrollo.

[Descargar APK 0.1.0 (1)](https://expo.dev/artifacts/eas/9QWCxtXe0pAnXaov_sh9Uo7C6W8M2gYa2P0fw2WkK0M.apk).

Al probarla, prestá atención a:

- Si Disponible real se entiende de inmediato.
- Si agregar un movimiento resulta fácil.
- Si se entiende la diferencia entre descontar/sumar al pagar/cobrar y elegir
  «Ya está reflejado».
- Si los movimientos vencidos tienen sentido.
- Si algo resulta confuso o tedioso.
- Si Tu espacio genera curiosidad o distrae.

Para compartir feedback, contanos:

1. Qué esperabas que ocurriera.
2. Qué ocurrió realmente.
3. Qué te confundió.
4. Qué te hubiera gustado que existiera.
5. Si abrirías la app de nuevo por iniciativa propia.

## Versión Android

Alpha privada: `0.1.0`, Android `versionCode: 1`.
Identificador permanente: `com.diegomarin.mispagos`.
Cada futuro build Android debe incrementar `android.versionCode` en `app.json`.
El perfil `preview` genera un APK interno; `production` queda preparado para
un AAB futuro. El APK se distribuye por EAS y no se guarda en Git.
