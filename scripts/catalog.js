await new FireStorage("Catalog").GetDocuments().then((Documents) => {
    Documents.forEach(Document => {
        const Node = document.createElement("div");
        Node.innerHTML = `<img src="${Document.Thumbnail}">`.replaceAll("\n", "");
        Discover.appendChild(Node);

        const Description = `
            <div class="TextLabels">
                <span button>Watch</span>
                <span class="Rating">${Document.Rating}</span>
                <div class="Tags">${Document.Tags.map(Tag => `<span>${Tag}</span>`).join("•")}</div>
            </div>
        `.replaceAll("\n", "");

        let BannerHideTimeout;

        Node.Hover(() => {
            Banner.style.display = "flex";
            setTimeout(() => Banner.style.opacity = 1, 250);

            Banner.innerHTML = `
                <img src="${Document.Thumbnail}">
                ${Description}
            `.replaceAll("\n", "");

            Banner.style.left = `${Node.offsetLeft}px`;
            Banner.style.top = `${Node.offsetTop}px`;

            function Trailer() {
                const ShowThumbnail = () => {
                    Banner.innerHTML = `
                        <img src="${Document.Thumbnail}">
                        ${Description}
                    `.replaceAll("\n", "");
                    setTimeout(ShowVideo, 2500);
                };
            
                const ShowVideo = () => {
                    Banner.innerHTML = `
                        <video src="${Document.Series[0]}"></video>
                        <img header src="${Document.Header}">
                        ${Description}
                    `.replaceAll("\n", "");
            
                    const Video = Banner.querySelector("video");
                    Video.play();
            
                    Video.addEventListener("ended", ShowThumbnail, { once: true });
                };
            
                ShowVideo();
            }

            Banner.querySelector("img").Hover(Trailer, 1250);
            Banner.querySelector("span[button]").addEventListener("click", () => Watch(Document.Name, Document.Series));
        }, 500);

        Banner.addEventListener("mouseleave", (e) => {
            BannerHideTimeout = setTimeout(() => {
                const related = document.elementFromPoint(e.clientX, e.clientY);
                if (!Banner.contains(related) && !Node.contains(related)) {
                    Banner.style.opacity = 0;
                    setTimeout(() => {
                        Banner.style.display = "none";
                        Banner.innerHTML = "";
                    }, 250);
                }
            }, 50);
        });

        Banner.addEventListener("mouseenter", () => clearTimeout(BannerHideTimeout));
    });
});