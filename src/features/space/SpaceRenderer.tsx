import { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";

import type { AchievementId } from "@/domain/achievements";
import type { SpaceStage } from "@/domain/engagement";
import type { PersonalizationSelection } from "@/domain/personalization";
import { themeFor } from "@/features/personalization/themes";
import { resolveSpaceScene, SCENE_HEIGHT, SCENE_WIDTH, SPACE_ASSETS, type AssetId } from "./spaceScene";

const room = require("../../../assets/space/runtime/empty-room.jpg");
const wallMask = require("../../../assets/space/runtime/wall-mask.png");
const floorMask = require("../../../assets/space/runtime/floor-mask.png");
const windowMask = require("../../../assets/space/runtime/window-mask.png");

export type CalibrationOffset = Partial<Record<AssetId, { x: number; y: number; width: number; zIndex: number }>>;

export function SpaceRenderer({ stage, selection, achievementUnlocks = [], width,
  calibrationOffsets }: {
  stage: SpaceStage; selection: PersonalizationSelection; achievementUnlocks?: readonly AchievementId[];
  width: number; calibrationOffsets?: CalibrationOffset;
}) {
  const theme = themeFor(selection.themeId);
  const unlockKey = achievementUnlocks.join("|");
  const interestKey = selection.interestIds.join("|");
  // Composition depends only on visual inputs; financial data never reaches the renderer.
  const scene = useMemo(() => resolveSpaceScene(stage, selection, achievementUnlocks),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stage, selection.themeId, selection.atmosphereId, interestKey, unlockKey]);
  const scale = width / SCENE_WIDTH;
  const imageStyle = { width, height: SCENE_HEIGHT * scale };
  const treatments = scene.treatments;
  return <View style={[styles.scene, imageStyle]}>
    <Image source={room} resizeMode="stretch" style={[styles.layer, imageStyle, { zIndex: 0 }]} />
    <Image source={wallMask} resizeMode="stretch" style={[styles.layer, imageStyle,
      { tintColor: theme.spaceWall, opacity: treatments.wallOpacity, zIndex: 10 }]} />
    <Image source={floorMask} resizeMode="stretch" style={[styles.layer, imageStyle,
      { tintColor: theme.spaceFloorTint, opacity: treatments.floorOpacity, zIndex: 11 }]} />
    <Image source={windowMask} resizeMode="stretch" style={[styles.layer, imageStyle,
      { tintColor: theme.spaceWindowTint, opacity: treatments.windowOpacity, zIndex: 12 }]} />
    {treatments.ambientOpacity > 0 && <View style={[styles.layer, imageStyle, { backgroundColor: theme.spaceAmbientTint,
      opacity: treatments.ambientOpacity, zIndex: 13 }]} />}
    {scene.objects.map(object => {
      const offset = calibrationOffsets?.[object.assetId];
      const objectWidth = Math.max(1, object.width + (offset?.width ?? 0));
      const objectHeight = objectWidth / (object.width / object.height);
      return <Image key={object.assetId} source={SPACE_ASSETS[object.assetId].source} resizeMode="stretch"
        style={{ position: "absolute", left: (object.x + (offset?.x ?? 0)) * scale,
          top: (object.y + (offset?.y ?? 0)) * scale, width: objectWidth * scale,
          height: objectHeight * scale, zIndex: object.zIndex + (offset?.zIndex ?? 0) }} />;
    })}
  </View>;
}

const styles = StyleSheet.create({
  scene: { position: "relative", overflow: "hidden" },
  layer: { position: "absolute", left: 0, top: 0 },
});
