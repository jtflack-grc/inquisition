from pathlib import Path

path = Path("src/app/ScenarioGlobe.tsx")
text = path.read_text()

old_point = '''        point: {
          pixelSize: isSelected ? 12 : 7,
          color: Cesium.Color.fromCssColorString(
            isSelected ? "#d0a668" : "#7ea4bf"
          ),
          outlineColor: Cesium.Color.fromCssColorString(
            isSelected ? "#fff2d6" : "#11161b"
          ),
          outlineWidth: isSelected ? 2 : 1,
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        },
'''

new_point = '''        point: {
          pixelSize: isSelected
            ? new Cesium.CallbackProperty(() => {
                const pulse = (Math.sin(Date.now() / 260) + 1) / 2;
                return 11 + pulse * 6;
              }, false)
            : 7,
          color: Cesium.Color.fromCssColorString(
            isSelected ? "#e06b6b" : "#7ea4bf"
          ),
          outlineColor: Cesium.Color.fromCssColorString(
            isSelected ? "#ffe0e0" : "#11161b"
          ),
          outlineWidth: isSelected ? 2.5 : 1,
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: isSelected
            ? Number.POSITIVE_INFINITY
            : undefined,
        },
'''

old_pulse = '''    const selectedPulse = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(
        selected.company.hqLon,
        selected.company.hqLat
      ),
      ellipse: {
        semiMajorAxis: 70_000,
        semiMinorAxis: 70_000,
        material: Cesium.Color.fromCssColorString("#d0a668").withAlpha(0.12),
        outline: true,
        outlineColor:
          Cesium.Color.fromCssColorString("#d0a668").withAlpha(0.82),
        height: 0,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    });
    selectedPulse.__inquisitionIncidentId = selected.id;
'''

new_pulse = '''    const selectedRed = Cesium.Color.fromCssColorString("#e06b6b");
    for (const phaseOffset of [0, 0.5]) {
      const radius = new Cesium.CallbackProperty(() => {
        const phase = ((Date.now() / 1800 + phaseOffset) % 1 + 1) % 1;
        return 55_000 + phase * 145_000;
      }, false);
      const ringColor = new Cesium.CallbackProperty(() => {
        const phase = ((Date.now() / 1800 + phaseOffset) % 1 + 1) % 1;
        return selectedRed.withAlpha(Math.max(0.06, 0.9 - phase * 0.84));
      }, false);
      const fillColor = new Cesium.CallbackProperty(() => {
        const phase = ((Date.now() / 1800 + phaseOffset) % 1 + 1) % 1;
        return selectedRed.withAlpha(Math.max(0.015, 0.13 - phase * 0.11));
      }, false);

      const selectedPulse = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          selected.company.hqLon,
          selected.company.hqLat
        ),
        ellipse: {
          semiMajorAxis: radius,
          semiMinorAxis: radius,
          material: new Cesium.ColorMaterialProperty(fillColor),
          outline: true,
          outlineColor: ringColor,
          height: 0,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
      });
      selectedPulse.__inquisitionIncidentId = selected.id;
    }
'''

if old_point not in text:
    raise SystemExit("Selected point block not found")
if old_pulse not in text:
    raise SystemExit("Selected pulse block not found")

text = text.replace(old_point, new_point).replace(old_pulse, new_pulse)
path.write_text(text)
