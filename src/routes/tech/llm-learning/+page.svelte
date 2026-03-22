<script>
	import Seo from '$lib/components/Seo.svelte';
	import { _metadata as metadata } from './+page.js';
</script>

<Seo title={metadata.title} keywords={metadata.tags} />

<h1>{metadata.title}</h1>
<p class="byline">
	<time datetime={metadata.date}>{metadata.date}</time>
</p>

<content>
	<p>
		Alright, I've been putting this off for a while now, mostly because I believe that a lot of the
		AI hype is over-blown, but because I am a part of the proletariat, I do need to keep my skills
		sharp according to the industry. Not necessarily what I believe. This will be a part of a series
		where I will be going over LLMs, CSI Block Projection and RAFT.
	</p>

	<p>
		Conceptually, I understand each from a high level, but my goal is to get from theoretical and
		conceptual knowledge to more practical and hands-on knowledge as this is the true path to
		learning. Before I can get to practical knowledge, however, I need to lay a solid foundation of
		understanding, so today I am starting off with understanding modern LLMs.
	</p>

	<h2>Current State</h2>

	<p>
		My current knowledge in this area is at best conversational. Currently, I understand that they
		have a similar architecture to any machine learning neural network and can be trained with
		different weights and a lot of compute power. These weights are automatically adjusted based on
		the training requirements and the outputted algorithm is able to do whatever job you theoretically
		trained it for(without the trainers really understanding why or how it does this so well).
	</p>

	<p>
		Although the architecture of these algorithms are similar, I believe the actual function of the
		code is what separates LLMs from general machine learning. It would make sense that machine
		learning is the mechanism used to <em>train</em> the algorithm, but the LLM itself is just a
		probabilistic language program and is trained to guess the correct next word purely based on
		weights, which, when you think about it, may just be how we are able to form language ourselves.
	</p>

	<p>Anyways, let's put my current understanding to the test!</p>

	<h2>Machine Learning vs Deep Learning</h2>

	<img
		src="/image/tech/llm-learning/learning-model-vd.png"
		alt="Learning Model Venn Diagram"
		loading="lazy"
	/>

	<p>
		In some preliminary research just on
		<a href="https://aws.amazon.com/what-is/neural-network/">neural networks</a>, I was able to
		understand the true difference between Machine Learning and Deep Learning:
	</p>

	<blockquote>
		Traditional machine learning methods require human input for the machine learning software to work
		sufficiently well. A data scientist manually determines the set of relevant features that the
		software must analyze. This limits the software's ability, which makes it tedious to create and
		manage.
	</blockquote>

	<blockquote>
		On the other hand, in deep learning, the data scientist gives only raw data to the software. The
		deep learning network derives the features by itself and learns more independently. It can analyze
		unstructured datasets like text documents, identify which data attributes to prioritize, and solve
		more complex problems.
	</blockquote>

	<p>
		Without additional context, that in and of itself is a little confusing. How would a deep learning
		model know if it is correctly identifying what needs to analyzed and trained given a dataset? But,
		these deep learning models rely on
		<a href="https://www.youtube.com/watch?v=oYm66fHqHUM">Foundational Models</a> for efficient
		processing of unstructured data and hidden relationship and pattern discovery. Basically,
		unsupervised/self-supervised learning.
	</p>

	<p>Naturally, this leads us to AI and ultimately, Transformers:</p>

	<blockquote>
		While machine learning and deep learning focus on prediction and pattern recognition, generative
		AI produces unique outputs based on the patterns it detects. Generative AI technology is built on
		transformer architecture that combines several different neural networks to combine data patterns
		in unique ways.
	</blockquote>

	<h3>A Quick Note on Neural Networks</h3>

	<p>
		The foundation of LLMs is built and trained leveraging neural networks. There is a great series on
		neural networks by
		<a href="https://www.3blue1brown.com/topics/neural-networks">3Blue1Brown</a> that I would
		recommend.
	</p>

	<h2>Transformers</h2>

	<img
		src="/image/tech/llm-learning/transformer-transparent.gif"
		alt="Transformers"
		loading="lazy"
	/>

	<p>
		<a href="https://arxiv.org/abs/1706.03762">Transformers</a> are a type of neural network
		architecture that transforms or changes an input sequence into an output sequence, computing
		hidden representations in parallel for all input and output positions, leveraging multi-head
		attention. It is important to note that transformers are an improvement and evolution on the
		shortcomings of a
		<a href="https://aws.amazon.com/what-is/recurrent-neural-network/"
			>Recurrent Neural Network</a
		>(RNN).
	</p>

	<p>
		RNN requires sequential processing of inputs, where order matters. This limits the amount of data
		that can be processed by the amount of memory on the node when batching large pieces of
		data(books and papers). For example, <em>Tom is a cat. Tom's favorite food is fish.</em>. RNN has
		strategies for remembering useful information, like Tom being a cat, but the ability to remember
		is ultimately limited and RNNs eventually have to forget information.
	</p>

	<p>
		With the introduction of self-attention, transformers are able to process data sequences in
		parallel, overcoming the memory limitations and sequence interdependencies of RNNs.
	</p>

	<blockquote>
		Self-attention, sometimes called intra-attention is an attention mechanism relating different
		positions of a single sequence in order to compute a representation of the sequence. --
		<a href="https://arxiv.org/abs/1706.03762">Attention Is All You Need</a>
	</blockquote>

	<p>
		The transformer's self-attention layer is able to compute and store the relationships between
		words using embeddings, which are numerical vectors that capture their semantic meaning. The core
		of self-attention involves calculating attention scores. For each query, the model computes the
		<a
			href="https://www.khanacademy.org/math/multivariable-calculus/thinking-about-multivariable-function/x786f2022:vectors-and-matrices/a/dot-products-mvc"
			>dot product</a
		> with all the keys and then applies a softmax function to normalize the results. These scores
		represent the relevance of each key to the current query.
	</p>

	<img
		src="/image/tech/llm-learning/attention-algorithm.webp"
		alt="Attention Algorithm"
		loading="lazy"
	/>

	<p>
		More information on how transformers work under-the-hood can be found at
		<a
			href="https://towardsdatascience.com/transformers-explained-visually-part-2-how-it-works-step-by-step-b49fa4a64f34/"
			>Transformers Explained Visually</a
		>
	</p>

	<h2>Modern LLMs</h2>

	<p>
		Modern LLMs are advanced neural networks that adhere to the transformer architecture and are
		trained on huge amounts of datasets using self-supervised learning during pre-training. When
		fine-tuning a model, Reinforcement Learning from Human Feedback (RLHF) is leveraged to ensure
		proper results. It is important to understand that these models are <em>huge</em>, often ranging
		from a billion to over a trillion different parameters.
	</p>

	<h2>Where to Next?</h2>

	<p>
		With a solid foundation around understanding the state of modern LLMs, there are a few different
		routes that could be taken to further learning. The practical side and the theoretical side.
	</p>

	<p>For more practical, hands-on learning, check out:</p>

	<ul>
		<li><a href="https://course.fast.ai/">Practical Deep Learning for Coders</a></li>
		<li>
			<a href="https://huggingface.co/learn/llm-course/chapter1/1">Hugging Face LLM Course</a>
		</li>
		<li>
			<a href="https://docs.pytorch.org/tutorials/beginner/basics/intro"
				>Getting Started with PyTorch</a
			>
		</li>
	</ul>

	<p>To get a more in-depth understanding of the theoretical side of LLMs, check out:</p>

	<ul>
		<li>
			<a href="https://arxiv.org/abs/1706.03762">Attention Is All You Need</a>
		</li>
		<li>
			<a
				href="https://medium.com/@ikim1994914/understanding-the-modern-llm-part-1-source-and-target-masks-in-transformers-and-example-use-5fb72af3bd57"
				>Understanding the Modern LLM</a
			>
		</li>
		<li>
			<a
				href="https://sidecar.ai/blog/demystifying-vectors-and-embeddings-in-ai-a-beginners-guide"
				>Demystifying Vectors and Embeddings</a
			>
		</li>
		<li>
			<a
				href="https://medium.com/@touhid3.1416/the-surprisingly-simple-math-behind-transformer-attention-mechanism-d354fbb4fef6"
				>The Math Behind Transformers</a
			>
		</li>
		<li>any other links that were included in this article!</li>
	</ul>

	<p>
		That wraps up my learnings for modern LLMs! I just barely scratched the surface here, but to go
		more in-depth will take some time and I'll be sure to include follow-up articles.
	</p>
</content>

<p>
	{#each metadata.tags as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</p>
