---
layout: post
title:  "Scrolling is Hard: A Journey into the UIScrollView"
date:   2023-05-23 15:40:05 +0200
categories: jekyll update
---
## Part 1: The Intro

Dedicated readers may remember my old company Technaplex. During the waning hours of 2019, an idea was proposed: an ebook reader with nebulous features (autoscrolling? actually working?). I began work on an implementation; once I completed the "simple" step of displaying an ebook, progress could begin.

Parsing an epub, the part I was worried about, was actually fairly easy. (Things are especially easy when @tybug does them for you.) EPUBs are actually just zip files which (if they are standardized) contain lots of xml and such, and a HTML (or xhtml) file for each chapter that says how it is laid out. So an epub reader is, in essence, just a glorified html reader. Conveniently Apple gives you a [`WKWebView.loadHTMLString`](https://developer.apple.com/documentation/webkit/wkwebview/1415004-loadhtmlstring) method! With remarkably high-quality (for Apple) documentation to go alongside.

Based on empirical analysis of the Apple Books app animation (using it every day for like 5 years) and of the name of the class I decided to use a `PageViewController` to control the pages. Each page is a html file and it...wait. The chapters are the html files. So how can I just display one page at a time?

## Part 2: This should really work

"Breaking a chapter into pages" is one of those things, up there alongside general cognition, that is not built in to computers. A computer doesn't know where the page breaks are in a chapter, because it doesn't know how the chapter will be displayed. And a web view can't know how the chapter is displayed until it displays it, at which point it is too late to then display a page since the user would see a weird flickering. However, we can just approximate it by saying a page is roughly as tall as the height of the screen, and then calculating a small offset to account for text being cut off midline.

So my idea was to have each `Page` be represented by a web view displaying the html of the whole chapter. However, it has sneakily been scrolled to a value which is the phone's height multiplied by the current page number. So, when the user makes a horizontal scrolling motion (as one does on a mobile ebook reader), the app is actually secretly vertically scrolling the next web view to the next page.

I wrote (essentially) the following code to achieve this (alongside a lot of Swift boilerplate, thanks apple):

```swift
func load() {
  webView.loadHTMLString(chapter, baseURL: nil)
}

func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
  let scrollPoint = CGPoint(x: 0, y: height * CGFloat(pageNumber))
  webView.scrollView.setContentOffset(scrollPoint, animated: false)
}
```

The first method will load in the html string, the second method will be called when it is loaded and will scroll the view. However, no matter where I put this code (before the view appears, while the view is loading, after the view has loaded), it did not work. It loaded the text but it simply did not scroll the view.

However, there was one thing that I tried that did in fact work. When I set animated to true while scrolling, it scrolled gloriously, while exposing my vertical secret. But animated = false just did nothing!

Why would they do this to me? Why add the ability to set `animated = false` just to have it not work? If you set a scroll notifier for what content offsets are actually happening here you get:

```
didScroll (0.0, 100.0) <-- the actual scroll (in this example height is 100 and pageNumber is 1)
didScroll (0.0, 0.0)
didScroll (0.0, -102.0)
didScroll (0.0, 0.0)
didScroll (0.0, 518.3333333333334)
didScroll (0.0, 398.0)
didScroll (0.0, 0.0)
```

Why?

## Part 3: Four years of toiling; chatgpt lies to me

It took me roughly four years of not working on this project anymore to fix this issue. I eventually decided, while studying abroad, to focus on it rather than complete the homework for my classes. (For a review of the German school system, see [here](innoviox.github.io).) 

There are a few ways to go about solving this issue. You can handle the scrolling that the `scrollViewDidScroll` and cancel it if it's not the scroll that you want to have happened; the issue is that by this point the scrolling has already happened, so there's a slight flickering as the page bounces around. Most of the scrollView delegate methods are unsurprisingly for handling animated scrolling, which again we do not (as this scrolling is secret and unanimated). I asked ChatGPT for help several times on this question at the advice of various friends. It did not go super well. It mostly led me back and forth between different delegate methods without changing anything, as well as making up a plist attribute that doesn't exist. 

![Screen Shot 2023-10-05 at 1.25.32 AM](https://innoviox.github.io/img/s1.png)

We must go deeper.

Into the realm of Javascript.

Since the html displayer is a `WKWebView`, we can take advantage of the `webView.evaluateJavaScript` method to use arbitrary javascript code. I wrote a method (which literally came to me in a dream) to measure the height of each paragraph and element on the page, and then cut off the page by adding whitespace before elements that would cross page boundaries. As I don't want to burn your eyes with swift-embedded javascript string literals, I will not post it here. 

So that is the story of why, avid Saga reader from the distant future, sometimes the text on pages is different heights -- there's secretly a white rectangle stopping a naughty paragraph from exposing my vertical scrolling. (And why, if you went and built Saga right now, sometimes there is a gray rectangle on the bottom of pages. I'm sure that'll be fixed soon.) 

Hopefully this blog will soon be filled with similar adventures! Stay tuned. 