$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$sourceDir = Join-Path $PSScriptRoot '..\assets\assets mis pagos'
$targetDir = Join-Path $PSScriptRoot '..\assets\space\runtime'
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

public static class SpaceAssetBuild {
  static Bitmap Read32(string path) {
    using (var source = new Bitmap(path)) {
      var result = new Bitmap(source.Width, source.Height, PixelFormat.Format32bppArgb);
      using (var g = Graphics.FromImage(result)) {
        g.Clear(Color.Transparent);
        g.DrawImageUnscaled(source, 0, 0);
      }
      return result;
    }
  }
  static byte[] Pixels(Bitmap image) {
    var area = new Rectangle(0, 0, image.Width, image.Height);
    var data = image.LockBits(area, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
    try {
      var bytes = new byte[data.Stride * image.Height];
      Marshal.Copy(data.Scan0, bytes, 0, bytes.Length);
      return bytes;
    } finally { image.UnlockBits(data); }
  }
  static Bitmap FromPixels(int width, int height, byte[] bytes) {
    var image = new Bitmap(width, height, PixelFormat.Format32bppArgb);
    var data = image.LockBits(new Rectangle(0, 0, width, height), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
    try { Marshal.Copy(bytes, 0, data.Scan0, bytes.Length); }
    finally { image.UnlockBits(data); }
    return image;
  }
  public static void Mask(string source, string target) {
    using (var input = Read32(source)) {
      var bytes = Pixels(input);
      for (int i = 0; i < bytes.Length; i += 4) {
        double luminance = 0.2126 * bytes[i + 2] + 0.7152 * bytes[i + 1] + 0.0722 * bytes[i];
        bytes[i] = bytes[i + 1] = bytes[i + 2] = 255;
        bytes[i + 3] = luminance >= 128 ? (byte)255 : (byte)0;
      }
      using (var result = FromPixels(input.Width, input.Height, bytes)) result.Save(target, ImageFormat.Png);
    }
  }
  public static void Room(string source, string target) {
    using (var image = new Bitmap(source)) {
      var encoder = Array.Find(ImageCodecInfo.GetImageEncoders(), x => x.MimeType == "image/jpeg");
      using (var settings = new EncoderParameters(1)) {
        settings.Param[0] = new EncoderParameter(Encoder.Quality, 85L);
        image.Save(target, encoder, settings);
      }
    }
  }
  public static void Calibration(string source, string target) {
    using (var input = new Bitmap(source))
    using (var result = new Bitmap(900, 675)) {
      using (var g = Graphics.FromImage(result)) {
        g.InterpolationMode = InterpolationMode.HighQualityBicubic;
        g.DrawImage(input, 0, 0, 900, 675);
      }
      var encoder = Array.Find(ImageCodecInfo.GetImageEncoders(), x => x.MimeType == "image/jpeg");
      using (var settings = new EncoderParameters(1)) {
        settings.Param[0] = new EncoderParameter(Encoder.Quality, 85L);
        result.Save(target, encoder, settings);
      }
    }
  }
  public static string Object(string source, string target, int maxDimension, bool cat) {
    using (var input = Read32(source)) {
      var bytes = Pixels(input);
      int minX = input.Width, minY = input.Height, maxX = -1, maxY = -1;
      for (int y = 0; y < input.Height; y++) for (int x = 0; x < input.Width; x++) {
        int i = (y * input.Width + x) * 4;
        if (cat) {
          // The photographed background is nearly uniform warm white; remove it at build time.
          int d = Math.Max(Math.Abs(bytes[i] - 246), Math.Max(Math.Abs(bytes[i + 1] - 250), Math.Abs(bytes[i + 2] - 253)));
          int alpha = Math.Max(0, Math.Min(255, (d - 14) * 255 / 22));
          if (y > 930) {
            int warmth = Math.Min(bytes[i + 2] - bytes[i + 1], bytes[i + 1] - bytes[i]);
            alpha = alpha * Math.Max(0, Math.Min(6, warmth - 8)) / 6;
            alpha = alpha * Math.Max(0, Math.Min(40, x - 350)) / 40;
            alpha = alpha * Math.Max(0, Math.Min(40, 1035 - x)) / 40;
            alpha = alpha * Math.Max(0, Math.Min(40, 1170 - y)) / 40;
          }
          bytes[i + 3] = (byte)alpha;
        }
        if (bytes[i + 3] > 10) {
          minX = Math.Min(minX, x); minY = Math.Min(minY, y);
          maxX = Math.Max(maxX, x); maxY = Math.Max(maxY, y);
        }
      }
      if (maxX < minX) throw new Exception("Empty object: " + source);
      using (var clean = FromPixels(input.Width, input.Height, bytes)) {
        var crop = Rectangle.FromLTRB(minX, minY, maxX + 1, maxY + 1);
        double factor = Math.Min(1.0, (double)maxDimension / Math.Max(crop.Width, crop.Height));
        int width = Math.Max(1, (int)Math.Round(crop.Width * factor));
        int height = Math.Max(1, (int)Math.Round(crop.Height * factor));
        using (var result = new Bitmap(width, height, PixelFormat.Format32bppArgb)) {
          using (var g = Graphics.FromImage(result)) {
            g.Clear(Color.Transparent);
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.CompositingQuality = CompositingQuality.HighQuality;
            g.PixelOffsetMode = PixelOffsetMode.HighQuality;
            g.DrawImage(clean, new Rectangle(0, 0, width, height), crop, GraphicsUnit.Pixel);
          }
          result.Save(target, ImageFormat.Png);
        }
        return string.Format("{0}x{1} crop={2},{3},{4},{5}", width, height, crop.X, crop.Y, crop.Width, crop.Height);
      }
    }
  }
}
'@

$masks = @{
  'wall-mask.png' = 'Máscara minimalista de habitación en blanco y negro.png'
  'floor-mask.png' = 'Máscara binaria de habitación vacía.png'
  'window-mask.png' = 'Máscara minimalista de ventana blanca.png'
}
foreach ($item in $masks.GetEnumerator()) {
  [SpaceAssetBuild]::Mask((Join-Path $sourceDir $item.Value), (Join-Path $targetDir $item.Key))
}
[SpaceAssetBuild]::Room((Join-Path $sourceDir 'Rincón minimalista bañado por el sol.png'), (Join-Path $targetDir 'empty-room.jpg'))
$calibrationDir = Join-Path $PSScriptRoot '..\assets\space\calibration'
New-Item -ItemType Directory -Force -Path $calibrationDir | Out-Null
[SpaceAssetBuild]::Calibration((Join-Path $sourceDir 'Rincón de trabajo acogedor y minimalista(5).png'),
  (Join-Path $calibrationDir 'master-reference.jpg'))

$objects = @(
  @('desk', 'Escritorio escandinavo de madera clara.png', 600),
  @('shelf', 'Estantería modular de madera clara.png', 600),
  @('monitor', 'Monitor moderno minimalista en fondo transparente.png', 600),
  @('desk-lamp', 'Lámpara de escritorio verde oliva.png', 360),
  @('plant-large', 'Planta frondosa en maceta crema.png', 600),
  @('plant-small', 'Planta pothos en maceta cerámica.png', 360),
  @('books', 'Pila de libros en tonos cálidos.png', 360),
  @('mug', 'Taza cerámica bicolor sobre fondo transparente.png', 360),
  @('gamepad', 'Controlador gamer moderno en grafito.png', 360),
  @('speaker-vinyl', 'Altavoz moderno y disco de vinilo.png', 360),
  @('moon-lamp', 'Lámpara de luna sobre base de madera.png', 360),
  @('cat-figurine', 'Gato cerámico minimalista y sereno.png', 360),
  @('scented-candle', 'Vela aromática minimalista en tonos cálidos.png', 320),
  @('candle-trio', 'Trío de velas cálidas y acogedoras.png', 320),
  @('tarot-deck', 'Mazo de tarot místico con sol y luna.png', 320),
  @('rose-quartz', 'Cristal de cuarzo rosa sobre base de piedra.png', 320),
  @('warm-lamp', 'Lámpara minimalista de luz cálida.png', 320),
  @('calico-cat', 'Gato de cerámica sereno estilo calicó.png', 320),
  @('cat-mug', 'Taza de gato con orejas rosa y crema.png', 320),
  @('cat-frame', 'Marco de madera con gato sereno.png', 320),
  @('peonies', 'Ramo de peonías en jarrón cerámico.png', 320),
  @('dried-flowers', 'Arreglo seco en jarrón beige.png', 320),
  @('perfume', 'Perfume esférico rosa con tapón marfil.png', 320),
  @('vanity-organizer', 'Organizador de tocador en tonos cálidos.png', 320),
  @('floral-notebook', 'Cuaderno floral con banda rosada.png', 320),
  @('jewelry-box', 'Joyero oval de terciopelo rosado y dorado.png', 320),
  @('vanity-mirror', 'Espejo de tocador dorado con base de piedra.png', 320)
)
foreach ($entry in $objects) {
  $target = Join-Path $targetDir ($entry[0] + '.png')
  $details = [SpaceAssetBuild]::Object((Join-Path $sourceDir $entry[1]), $target, $entry[2], ($entry[0] -eq 'cat-figurine'))
  '{0}: {1}' -f $entry[0], $details
}
