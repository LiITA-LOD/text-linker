from stanza import Pipeline


class TokenizerService:
    """Service class for handling text tokenization operations."""

    def __init__(self):
        """Initialize the tokenizer service with the specified model path."""
        self.pipeline_plain: Pipeline
        self.pipeline_conllu: Pipeline
        self._initialize_pipelines()

    def _initialize_pipelines(self) -> None:
        """Initialize the tokenizer pipelines with the specified model path."""
        options = dict(
            lang="it",
            download_method=None,
            processors="tokenize,pos,lemma,depparse",
        )
        self.pipeline_plain = Pipeline(**options, tokenize_pretokenized=False)
        self.pipeline_conllu = Pipeline(**options, tokenize_pretokenized=True)

    def tokenize_plain_text(self, source: str) -> str:
        """Tokenize plain text and return CoNLL-U format."""
        return "{:C}".format(self.pipeline_plain(source))

    def tokenize_conllu_text(self, source: str) -> str:
        """Tokenize pre-tokenized CoNLL-U text and return CoNLL-U format."""
        return "{:C}".format(self.pipeline_conllu(source))

    def tokenize(self, source: str, format: str) -> str:
        """Main tokenization method that handles both plain and CoNLL-U formats."""
        if format == "plain":
            return self.tokenize_plain_text(source)
        elif format == "conllu":
            return self.tokenize_conllu_text(source)
        else:
            raise ValueError(f"Unsupported format: {format}")
