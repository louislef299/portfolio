---
title: "An Introduction to Modern LLMs"
date: 2025-05-17T11:09:21-05:00
draft: false
tags:
- llm
---

Alright, I've been putting this off for a while now, mostly because I believe
that a lot of the AI hype is over-blown, but because I am a part of the
proletariat, I do need to keep my skills sharp according to the industry. Not
necessarily what I believe. This will be a part of a series where I will be
going over LLMs, CSI Block Projection and RAFT.

Conceptually, I understand each from a high level, but my goal is to get from
theoretical and conceptual knowledge to more practical and hands-on knowledge as
this is the true path to learning. Before I can get to practical knowledge,
however, I need to lay a solid foundation of understanding, so today I am
starting off with understanding modern LLMs.

## Current State

My current knowledge in this area is at best conversational. Currently, I
understand that they have a similar architecture to any machine learning neural
network and can be trained with different weights and a lot of compute power.
These weights are automatically adjusted based on the training requirements and
the outputted algorithm is able to do whatever job you theoretically trained it
for(without the trainers really understanding why or how it does this so well).

Although the architecture of these algorithms are similar, I believe the actual
function of the code is what separates LLMs from general machine learning. It
would make sense that machine learning is the mechanism used to *train* the
algorithm, but the LLM itself is just a probabilistic language program and is
trained to guess the correct next word purely based on weights, which, when
you think about it, may just be how we are able to form language ourselves.

Anyways, let's put my current understanding to the test!

## Machine Learning vs Deep Learning

![Learning Model Venn Diagram](/image/learning-model-vd.png)

In some preliminary research just on [neural networks][], I was able to
understand the true difference between Machine Learning and Deep Learning:

> Traditional machine learning methods require human input for the machine
> learning software to work sufficiently well. A data scientist manually
> determines the set of relevant features that the software must analyze. This
> limits the software’s ability, which makes it tedious to create and manage.
>
> On the other hand, in deep learning, the data scientist gives only raw data to
> the software. The deep learning network derives the features by itself and
> learns more independently. It can analyze unstructured datasets like text
> documents, identify which data attributes to prioritize, and solve more
> complex problems.

Without additional context, that in and of itself is a little confusing. How
would a deep learning model know if it is correctly identifying what needs to
analyzed and trained given a dataset? But, these deep learning models rely on
[Foundational Models][] for efficient processing of unstructured data and hidden
relationship and pattern discovery. Basically, unsupervised/self-supervised
learning.

Naturally, this leads us to AI and ultimately, Transformers:

> While machine learning and deep learning focus on prediction and pattern
> recognition, generative AI produces unique outputs based on the patterns it
> detects. Generative AI technology is built on transformer architecture that
> combines several different neural networks to combine data patterns in unique
> ways.

### A Quick Note on Neural Networks

The foundation of LLMs is built and trained leveraging neural networks. There is
a great series on neural networks by [3Blue1Brown][] that I would recommend.

## Transformers

![Transformers](/image/transformer-transparent.gif)

<!-- need to fix this for copy-right reasons... put in your own words! -->
[Transformers][] are a type of neural network architecture that transforms or
changes an input sequence into an output sequence, computing hidden
representations in parallel for all input and output positions, leveraging
multi-head attention. It is important to note that transformers are an
improvement and evolution on the shortcomings of a [Recurrent Neural
Network][](RNN).

RNN requires sequential processing of inputs, where order matters. This limits
the amount of data that can be processed by the amount of memory on the node
when batching large pieces of data(books and papers). For example, *Tom is a
cat. Tom’s favorite food is fish.*. RNN has strategies for remembering useful
information, like Tom being a cat, but the ability to remember is ultimately
limited and RNNs eventually have to forget information.

With the introduction of self-attention, transformers are able to process data
sequences in parallel, overcoming the memory limitations and sequence
interdependencies of RNNs.

> Self-attention, sometimes called intra-attention is an attention mechanism
> relating different positions of a single sequence in order to compute a
> representation of the sequence. -- [Attention Is All You Need][Transformers]

The transformer's self-attention layer is able to compute and store the
relationships between words using embeddings, which are numerical vectors that
capture their semantic meaning. The core of self-attention involves calculating
attention scores. For each query, the model computes the [dot product][] with
all the keys and then applies a softmax function to normalize the results. These
scores represent the relevance of each key to the current query.

![Attention Algorithm](/image/attention-algorithm.webp)

More information on how transformers work under-the-hood can be found
[here][Transformers Explained Visually]

## Modern LLMs

Modern LLMs are advanced neural networks that adhere to the transformer
architecture and are trained on huge amounts of datasets using self-supervised
learning during pre-training. When fine-tuning a model, Reinforcement Learning
from Human Feedback (RLHF) is leveraged to ensure proper results. It is
important to understand that these models are *huge*, often ranging from a
billion to over a trillion different parameters.

## Where to Next?

With a solid foundation around understanding the state of modern LLMs, there are
a few different routes that could be taken to further learning. The practical
side and the theoretical side.

For more practical, hands-on learning, check out:

- [Practical Deep Learning for Coders][]
- [Hugging Face LLM Course][]
- [Getting Started with PyTorch][]

To get a more in-depth understanding of the theoretical side of LLMs, check out:

- [Attention Is All You Need][Transformers]
- [Understanding the Modern LLM][]
- [Demystifying Vectors and Embeddings][]
- [The Math Behind Transformers][]
- any other links that were included in this article!

That wraps up my learnings for modern LLMs! I just barely scratched the surface
here, but to go more in-depth will take some time and I'll be sure to include
follow-up articles.

[3Blue1Brown]: https://www.3blue1brown.com/topics/neural-networks
[Demystifying Vectors and Embeddings]: https://sidecar.ai/blog/demystifying-vectors-and-embeddings-in-ai-a-beginners-guide
[dot product]: https://www.khanacademy.org/math/multivariable-calculus/thinking-about-multivariable-function/x786f2022:vectors-and-matrices/a/dot-products-mvc
[Foundational Models]: https://www.youtube.com/watch?v=oYm66fHqHUM
[Getting Started with PyTorch]: https://docs.pytorch.org/tutorials/beginner/basics/intro
[Hugging Face LLM Course]: https://huggingface.co/learn/llm-course/chapter1/1
[neural networks]: https://aws.amazon.com/what-is/neural-network/
[Practical Deep Learning for Coders]: https://course.fast.ai/
[Recurrent Neural Network]: https://aws.amazon.com/what-is/recurrent-neural-network/
[The Math Behind Transformers]: https://medium.com/@touhid3.1416/the-surprisingly-simple-math-behind-transformer-attention-mechanism-d354fbb4fef6
[Transformers]: https://arxiv.org/abs/1706.03762
[Transformers Explained Visually]: https://towardsdatascience.com/transformers-explained-visually-part-2-how-it-works-step-by-step-b49fa4a64f34/
[Understanding the Modern LLM]: https://medium.com/@ikim1994914/understanding-the-modern-llm-part-1-source-and-target-masks-in-transformers-and-example-use-5fb72af3bd57
