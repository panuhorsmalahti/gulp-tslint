// Both template strings should work.
if (true) {
    throw new Error(`ruleSet "${ruleSet.description}" has no defined output for type: ${rule.type}`);
} else {
    throw new Error(`ruleSet "${ruleSet.description}" has no defined output tied to type: ${rule.type}`);
}
