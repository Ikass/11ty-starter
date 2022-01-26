---
title: Blog
description: Latest blog posts
layout: default
permalink: /posts/
eleventyNavigation:
  key: Posts
  order: 2
---

<div class="py-8 prose lg:prose-xl">
  <h1>{{ title }}</h1>
  <p>{{ description }}</p>
</div>

{%- for post in collections.posts %}

- [{{ post.data.title }}]({{ post.url }})

{%- endfor %}
