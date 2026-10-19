import { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";

import type { AchievementId } from "@/domain/achievements";
import type { SpaceStage } from "@/domain/engagement";
import type { PersonalizationSelection } from "@/domain/personalization";
import type { StoredSlotOverride, StoredVisualPreferences } from "@/data/repositories/spaceCustomizationRepository";
import { themeFor } from "@/features/personalization/themes";
import { effectiveAppearance, resolveFinalSpaceScene, EMPTY_VISUAL_PREFERENCES } from "./spaceCustomization";
import { SCENE_HEIGHT, SCENE_WIDTH, SCENE_LAYERS, SPACE_ASSETS, type AssetId } from "./spaceScene";

const room = require("../../../assets/space/runtime/empty-room.jpg");
const wallMask = require("../../../assets/space/runtime/wall-mask.png");
const floorMask = require("../../../assets/space/runtime/floor-mask.png");
const windowMask = require("../../../assets/space/runtime/window-mask.png");

export type CalibrationOffset = Partial<Record<AssetId, { x: number; y: number; width: number; zIndex: number }>>;

export function SpaceRenderer({ stage, selection, achievementUnlocks = [], width,
  calibrationOffsets, slotOverrides = [], visualPreferences = EMPTY_VISUAL_PREFERENCES }: {
  stage: SpaceStage; selection: PersonalizationSelection; achievementUnlocks?: readonly AchievementId[];
  width: number; calibrationOffsets?: CalibrationOffset; slotOverrides?: readonly StoredSlotOverride[];
  visualPreferences?: StoredVisualPreferences;
}) {
  const appearance = effectiveAppearance(selection, achievementUnlocks, visualPreferences);
  const theme = themeFor(appearance.paletteId);
  const unlockKey = achievementUnlocks.join("|");
  const interestKey = selection.interestIds.join("|");
  const overrideKey = slotOverrides.map(row => `${row.slotId}:${row.assetId ?? "empty"}`).join("|");
  // Composition depends only on visual inputs; financial data never reaches the renderer.
  const scene = useMemo(() => resolveFinalSpaceScene(stage, selection, achievementUnlocks, slotOverrides, visualPreferences),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stage, selection.themeId, selection.atmosphereId, interestKey, unlockKey, overrideKey,
      visualPreferences.roomPaletteId, visualPreferences.windowMoodId, visualPreferences.wallColor,
      visualPreferences.ambientColor, visualPreferences.automaticVariant, visualPreferences.decorationMode]);
  const scale = width / SCENE_WIDTH;
  const imageStyle = { width, height: SCENE_HEIGHT * scale };
  const treatments = scene.treatments;
  return <View style={[styles.scene, imageStyle]}>
    <Image source={room} resizeMode="stretch" style={[styles.layer, imageStyle, { zIndex: SCENE_LAYERS.background.zIndex }]} />
    <Image source={wallMask} resizeMode="stretch" style={[styles.layer, imageStyle,
      { tintColor: appearance.wallColor ?? theme.spaceWall, opacity: treatments.wallOpacity, zIndex: SCENE_LAYERS.wall.zIndex }]} />
    <Image source={floorMask} resizeMode="stretch" style={[styles.layer, imageStyle,
      { tintColor: theme.spaceFloorTint, opacity: treatments.floorOpacity, zIndex: SCENE_LAYERS.floor.zIndex }]} />
    <Image source={windowMask} resizeMode="stretch" style={[styles.layer, imageStyle,
      { tintColor: appearance.ambientColor ?? theme.spaceWindowTint, opacity: treatments.windowOpacity, zIndex: SCENE_LAYERS.window.zIndex }]} />
    {(treatments.ambientOpacity > 0 || appearance.ambientColor) && <View style={[styles.layer, imageStyle, { backgroundColor: appearance.ambientColor ?? theme.spaceAmbientTint,
      opacity: appearance.ambientColor ? 0.12 : treatments.ambientOpacity, zIndex: SCENE_LAYERS.ambient.zIndex }]} />}
    {scene.objects.map(object => {
      const offset = calibrationOffsets?.[object.assetId];
      const objectWidth = Math.max(1, object.width + (offset?.width ?? 0));
      const objectHeight = objectWidth / (object.width / object.height);
      return <Image key={object.assetId} source={SPACE_ASSETS[object.assetId].source} resizeMode="stretch"
        style={{ position: "absolute", left: (object.x + (offset?.x ?? 0)) * scale,
          top: (object.y + (offset?.y ?? 0)) * scale, width: objectWidth * scale,
          height: objectHeight * scale, zIndex: object.depth.zIndex + (offset?.zIndex ?? 0) }} />;
    })}
  </View>;
}

const styles = StyleSheet.create({
  scene: { position: "relative", overflow: "hidden" },
  layer: { position: "absolute", left: 0, top: 0 },
});
