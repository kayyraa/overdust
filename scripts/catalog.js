await new FireStorage("Catalog").GetDocuments().then((Documents) => {
    let NewestDocument = Documents.reduce((A, B) => A.Timestamp > B.Timestamp ? A : B);

    Documents.forEach(Document => {
        const Node = document.createElement("div");
        Node.innerHTML = `
            <img src="${Document.Thumbnail}">
            ${Document === NewestDocument ? `<span class="New">New</span>` : ""}
        `.replaceAll("\n", "");
        Node.style.order = -Document.Timestamp;
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
                        <video src="${Document.Series[0]}" playsinline></video>
                        <img header src="${Document.Header}">
                        ${Description}
                    `.replaceAll("\n", "");

                    const Video = Banner.querySelector("video");
                    Video.addEventListener("canplaythrough", () => {
                        Video.play();
                        Video.addEventListener("ended", ShowThumbnail, { once: true });
                    }, { once: true });

                    Video.load();
                };

                ShowVideo();
            }

            Banner.querySelector("img").Hover(Trailer, 1250);
            Banner.querySelector("span[button]").addEventListener("click", () => Watch(Document.Name, Document.Series));
        }, 500);

        Banner.addEventListener("mouseleave", (Event) => {
            BannerHideTimeout = setTimeout(() => {
                const Related = document.elementFromPoint(Event.clientX, Event.clientY);
                if (!Banner.contains(Related) && !Node.contains(Related)) {
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

Submission.addEventListener("click", () => SubmitSubmission());

const NameInput = SubmissionPanel.querySelector("div > .NameInput");
const RatingInput = SubmissionPanel.querySelector("div > .RatingInput");
const HeaderInput = SubmissionPanel.querySelector("div > .HeaderInput");
const ThumbnailInput = SubmissionPanel.querySelector("div > .ThumbnailInput");

const TagsContainer = SubmissionPanel.querySelector("div > .Tags");
const TagInsert = SubmissionPanel.querySelector("div > div[row] > .TagInsert");
const TagInput = SubmissionPanel.querySelector("div > div[row] > .TagInput");

const SeriesContainer = SubmissionPanel.querySelector("div > .Series");
const SeriesInsert = SubmissionPanel.querySelector("div > div[row] > .SeriesInsert");
const SeriesInput = SubmissionPanel.querySelector("div > div[row] > .SeriesInput");

const Submit = SubmissionPanel.querySelector("div > .Submit");

let Tags = [];
let Series = [];

TagInsert.addEventListener("click", () => {
    if (!TagInput.value) return;

    const Node = document.createElement("span");
    Node.innerHTML = TagInput.value;
    TagsContainer.querySelector("div").appendChild(Node);
    Tags.push(TagInput.value);

    Node.addEventListener("click", () => {
        Tags.filter((String) => String !== SeriesInput.value);
        Node.remove();
    });

    TagInput.value = ""
});

SeriesInsert.addEventListener("click", () => {
    if (!SeriesInput.value) return;

    const Node = document.createElement("span");
    Node.innerHTML = SeriesInput.value;
    SeriesContainer.querySelector("div").appendChild(Node);
    Series.push(SeriesInput.value);

    Node.addEventListener("click", () => {
        Series.filter((String) => String !== SeriesInput.value);
        Node.remove();
    });

    SeriesInput.value = ""
});

Submit.addEventListener("click", async () => {
    const Name = NameInput.value;
    const Rating = RatingInput.value;
    const Header = HeaderInput.value;
    const Thumbnail = ThumbnailInput.value;

    if (!Name || !Rating || !Header | !Thumbnail) return;

    await new FireStorage("Catalog").AppendDocument({
        Name: Name,
        Rating: Rating,
        Header: Header,
        Thumbnail: Thumbnail,
        Series: Series,
        Tags: Tags,
        Timestamp: Math.floor(Date.now() / 1000),
        Uuid: Uuid(16)
    });
    location.reload();
});