---
layout: post
title: "PSA: Google Is Wrong (or at least confusing)"
date: 2023-12-01 03:37:42 -5000
categories: jekyll update
---

I've been working for a few days on my yearly SwiftUI application to see if it has enough features yet that I can actually work with. I'm happy to say that this is now conclusively yes! Perhaps due to my react work over the last few months on [my eurail app](https://is-eurail-cheaper-git-main-innoviox.vercel.app/), SwiftUI is now much more intuitive and fleshed-out than it has seemed in years and projects past. 

This week's project is *moev*, a Swift app born of my desire while visiting New York City to calculate transit routes with a stop at a lunch place in the middle, which Apple Maps and Google Maps simply refuse to do. Seemingly, they won't do it because you don't know how long you will spend at the stop in the middle, so you don't know which transit options will be available at the end. I am planning on laying out my app like the (brilliant) Transit app, which shows a cascading sequence of possibilities depending on when you leave. So, you can intuitively see the best path. Also -- sometimes you're not concerned about exact timing, but just the options to get between the three places, which is quite inconvenient on Google Maps.

All of this is to say that I was parsing through the Google Routes API (which is different than the Google Directions API for...reasons) which returns the route's line as an "Encoded Polyline" string that looks like this:

<pre>_p~iF~ps|U_ulLnnqC_mqNvxq`@</pre>

If we break it down into the things that are each encoding a latitude-longitude pair, we get this:

<pre>(_p~iF, ~ps|U), (_ulL, nnqC), (_mqN, vxq`@)</pre>

Firstly, the way this works and how they ensure that this data is encoded into ASCII-displayable characters is quite cool. Read about it [here](https://developers.google.com/maps/documentation/utilities/polylinealgorithm). But do you see a slight problem with this?

How do we know how long each coordinate measurement is? Seemingly, some are 5 characters and some are 4 characters! Google gives us a helpful tip on solving this issue:

> Check the least significant bit of each byte group; if this bit is set to 1, the point is not yet fully formed and additional data must follow.

What is a byte group? Let's take a closer look.

If we expand the earlier points into their ASCII codes, we get:

<pre>95 112 126 105 70 126 112 115 124 85 95 117 108 76 110 110 113 67 95 109 113 78 118 120 113 96 64</pre>

Splitting them by the point boundaries we know (from the example in the docs), we get:

<pre>
(95 112 126 105 <b>70</b>, 126 112 115 124 <b>85</b>), (95 117 108 <b>76</b>, 110 110 113 <b>67</b>), (95 109 113 <b>78</b>, 118 120 113 96 <b>64</b>)
</pre>

I've bolded all the numbers less than 95, and they're all at the ends! So what they actually mean is:

> Check each letter received. If its ASCII value is greater than 94, the point is not yet fully formed and additional data must follow.

And how do you check if a value is greater than 94? Note that if $$n > 94$$, then $$n - 63 > 31$$. Therefore, we can check if its early bits are 1s -- otherwise known as the most significant bits!

So, by "the least significant bit of each byte group" Google means "the most significant bit of each byte"!

Why would they do this?

Unfortunately there are no answers here. If you need a google Routes and Autocomplete API implementation in Swift that returns helpful structs, see [here](https://github.com/Innoviox/moev/blob/main/moev/moev/APIHandler.swift) for the API and peruse the rest of the code at your leisure for example usage. Hopefully the app will soon be useful! See you next time.



