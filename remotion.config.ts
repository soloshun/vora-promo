import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// The film is type-heavy; 2 is a good quality/size balance for H.264 delivery.
Config.setCrf(18);
Config.setChromiumOpenGlRenderer("angle");
