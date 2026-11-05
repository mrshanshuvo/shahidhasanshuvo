import coreWebVitalsConfig from "eslint-config-next/core-web-vitals";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = [...coreWebVitalsConfig, eslintConfigPrettier];

export default eslintConfig;
