function youtubeEmbedUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, "");
    let videoId = "";

    if (hostname === "youtu.be") {
      videoId = url.pathname.slice(1);
    } else if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (url.pathname === "/watch") videoId = url.searchParams.get("v") ?? "";
      if (url.pathname.startsWith("/embed/"))
        videoId = url.pathname.split("/")[2] ?? "";
      if (url.pathname.startsWith("/shorts/"))
        videoId = url.pathname.split("/")[2] ?? "";
    }

    return /^[A-Za-z0-9_-]{11}$/.test(videoId)
      ? `https://www.youtube.com/embed/${videoId}`
      : null;
  } catch {
    return null;
  }
}

export function VideoEmbed({ url }: { url: string }) {
  const embedUrl = youtubeEmbedUrl(url);

  if (!embedUrl) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex font-semibold text-brand-700 hover:text-brand-800"
      >
        Watch lesson video
      </a>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded border border-ink-200 bg-ink-950 shadow-sm">
      <div className="aspect-video">
        <iframe
          title="Lesson video"
          src={embedUrl}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
}
