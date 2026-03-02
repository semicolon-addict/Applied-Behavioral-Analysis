import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/use-memo": "off",
      "react-hooks/purity": "off",
      "react/no-children-prop": "off",
      "react/no-unescaped-entities": "off",
      "import/no-anonymous-default-export": "off"
    }
  }
];

export default config;
