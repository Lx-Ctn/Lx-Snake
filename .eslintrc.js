module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: "standard",
	overrides: [
		{
			env: {
				node: true,
			},
			files: [".eslintrc.{js,cjs}"],
			parserOptions: {
				sourceType: "script",
			},
		},
	],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
	rules: {
		semi: ["off"],
		quotes: ["off"],
		indent: ["off"],
		"no-tabs": ["off"],
		"comma-dangle": ["off"],
		"no-unused-vars": ["warn"],
		"prefer-const": ["warn"],
		"space-in-parens": ["off"],
		"space-before-function-paren": ["off"],
		"spaced-comment": ["warn"],
		"no-multiple-empty-lines": ["off"],
		"no-fallthrough": ["off"],
		"lines-between-class-members": ["off"],
		"accessor-pairs": ["off"],
	},
};
