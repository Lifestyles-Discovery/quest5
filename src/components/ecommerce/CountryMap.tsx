import { worldMill } from "@react-jvectormap/world";
import { VectorMap } from "@react-jvectormap/core";
import { useTheme } from "../../context/ThemeContext";

export default function CountryMap() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Theme-aware colors
  const markerColor = isDark ? "#8aa6c2" : "#003366"; // brand-300 for dark, brand-500 for light
  const regionColor = isDark ? "#344054" : "#D0D5DD"; // gray-700 for dark, gray-300 for light
  const labelColor = isDark ? "#e4e7ec" : "#35373e"; // gray-200 for dark, dark gray for light
  const borderColor = isDark ? "#1d2939" : "white"; // gray-800 for dark, white for light

  return (
    <VectorMap
      map={worldMill}
      backgroundColor="transparent"
      markerStyle={{
        initial: {
          fill: markerColor,
        },
      }}
      markersSelectable={true}
      markers={[
        {
          latLng: [37.2580397, -104.657039],
          name: "United States",
          style: {
            fill: markerColor,
            borderWidth: 1,
            borderColor: borderColor,
            stroke: isDark ? "#667085" : "#383f47",
          },
        },
        {
          latLng: [20.7504374, 73.7276105],
          name: "India",
          style: { fill: markerColor, borderWidth: 1, borderColor: borderColor },
        },
        {
          latLng: [53.613, -11.6368],
          name: "United Kingdom",
          style: { fill: markerColor, borderWidth: 1, borderColor: borderColor },
        },
        {
          latLng: [-25.0304388, 115.2092761],
          name: "Sweden",
          style: {
            fill: markerColor,
            borderWidth: 1,
            borderColor: borderColor,
            strokeOpacity: 0,
          },
        },
      ]}
      zoomOnScroll={false}
      zoomMax={12}
      zoomMin={1}
      zoomAnimate={true}
      zoomStep={1.5}
      regionStyle={{
        initial: {
          fill: regionColor,
          fillOpacity: 1,
          fontFamily: "Outfit",
          stroke: "none",
          strokeWidth: 0,
          strokeOpacity: 0,
        },
        hover: {
          fillOpacity: 0.7,
          cursor: "pointer",
          fill: markerColor,
          stroke: "none",
        },
        selected: {
          fill: markerColor,
        },
        selectedHover: {},
      }}
      regionLabelStyle={{
        initial: {
          fill: labelColor,
          fontWeight: 500,
          fontSize: "13px",
          stroke: "none",
        },
        hover: {},
        selected: {},
        selectedHover: {},
      }}
    />
  );
}
