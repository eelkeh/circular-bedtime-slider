import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import CircularSlider from "./src/CircularSlider";
import { Circle, G } from "react-native-svg";

const MAX_RAD = 2 * Math.PI;

const STEP_MINUTE = 5;

const STEP = MAX_RAD / (12 * (60 / STEP_MINUTE)); // every hour has 12 (5 minute) steps

const START_POS = {
  startAngle: 0,
  angleLength: Math.PI,
};

const radToBase12 = (rad) => (rad / MAX_RAD) * 12;

const toMinutes = (fraction) => Math.round(fraction * 60);

const toTimeStr = (hours) =>
  `${Math.floor(hours).toString().padStart(2, "0")}:${toMinutes(hours % 1)
    .toString()
    .padStart(2, "0")}`;

let lastLength = 0;

export default function App() {
  const [circle, setCircle] = useState(START_POS);
  const [fullCycle, setFullCycle] = useState(false);
  const [hoursDiff, setHoursDiff] = useState(6);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(6);

  const onCircleUpdate = ({ startAngle, angleLength, moved }) => {
    // @note for performance: better to use a reducer here, so a sinlge setState call
    // to reduce the number of potential renders.

    // round to the nearest 5 minutes (like Apple bedtime)
    const roundedStartAngle = Math.round(startAngle / STEP) * STEP;
    const roundedAngleLength = Math.round(angleLength / STEP) * STEP;
    setCircle({
      startAngle: roundedStartAngle,
      angleLength: roundedAngleLength,
    });

    let isFullCycle = fullCycle;
    // did the controls pass each other?
    if (Math.abs(lastLength - angleLength) > 5.5) {
      isFullCycle = !fullCycle;
    }

    let newDiff = radToBase12(roundedAngleLength);
    if (fullCycle) newDiff += 12;
    if (moved === "end") {
      let newEndTime = (startTime + newDiff) % 24;
      setEndTime(newEndTime);
    } else if (moved === "start") {
      let newStartTime = endTime - newDiff;
      if (newStartTime < 0) newStartTime += 24;
      setStartTime(newStartTime);
    }
    setHoursDiff(newDiff);
    setFullCycle(isFullCycle);

    lastLength = angleLength;
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 16 }}>start</Text>
      <Text style={{ fontWeight: "bold", fontSize: 24 }}>
        {toTimeStr(startTime)}
      </Text>
      <Text style={{ fontSize: 16 }}>end</Text>
      <Text style={{ fontWeight: "bold", fontSize: 24 }}>
        {toTimeStr(endTime)}
      </Text>
      <Text style={{ fontSize: 16 }}>time slept</Text>
      <Text style={{ fontWeight: "bold", fontSize: 24 }}>
        {toTimeStr(hoursDiff)}
      </Text>
      <Text></Text>

      <CircularSlider
        startAngle={circle.startAngle}
        angleLength={circle.angleLength}
        onUpdate={onCircleUpdate}
        segments={5}
        strokeWidth={40}
        radius={145}
        gradientColorFrom="#ff9800"
        gradientColorTo="#ffcf00"
        showClockFace
        clockFaceColor="#9d9d9d"
        bgCircleColor="#171717"
        stopIcon={
          <G>
            <Circle r="22" fill="red" />
          </G>
        }
        startIcon={
          <G>
            <Circle r="22" fill="green" />
          </G>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
