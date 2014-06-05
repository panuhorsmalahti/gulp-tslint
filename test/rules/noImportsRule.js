// Just an example rule
function Rule() {
    Lint.Rules.AbstractRule.apply(this, arguments);
}

Rule.prototype = Object.create(Lint.Rules.AbstractRule.prototype);
Rule.prototype.apply = function(syntaxTree) {
    return this.applyWithWalker(new NoImportsWalker(syntaxTree, this.getOptions()));
};

function NoImportsWalker() {
    Lint.RuleWalker.apply(this, arguments);
}

NoImportsWalker.prototype = Object.create(Lint.RuleWalker.prototype);
NoImportsWalker.prototype.visitImportDeclaration = function (node) {
    // get the current position and skip over any leading whitespace
    var position = this.position() + node.leadingTriviaWidth();

    // create a failure at the current position
    this.addFailure(this.createFailure(position, node.width(), "import statement forbidden"));

    // call the base version of this visitor to actually parse this node
    Lint.RuleWalker.prototype.visitImportDeclaration.call(this, node);
};

exports.Rule = Rule;
