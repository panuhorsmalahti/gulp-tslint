// Just an example rule
function Rule() {
    Lint.Rules.AbstractRule.apply(this, arguments);
}

Rule.prototype = Object.create(Lint.Rules.AbstractRule.prototype);
Rule.prototype.apply = function(sourceFile) {
    return this.applyWithWalker(new NoImportsWalker(sourceFile, this.getOptions()));
};

function NoImportsWalker() {
    Lint.RuleWalker.apply(this, arguments);
}

NoImportsWalker.prototype = Object.create(Lint.RuleWalker.prototype);
NoImportsWalker.prototype.visitImportDeclaration = function (node) {
    // create a failure at the current position
    this.addFailure(this.createFailure(node.getStart(), node.getWidth(), "import statement forbidden"));

    // call the base version of this visitor to actually parse this node
    Lint.RuleWalker.prototype.visitImportDeclaration.call(this, node);
};

exports.Rule = Rule;
