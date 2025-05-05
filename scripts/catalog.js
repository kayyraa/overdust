function CreateDocumentNode(Document, IsNewest, Button = "Watch", Time = 0) {
    const Node = document.createElement("div");
    Node.innerHTML = `
        <img src="${Document.Thumbnail}">
        ${IsNewest ? `<span class="New">New</span>` : ""}
    `.replaceAll("\n", "");
    Node.style.order = -Document.Timestamp;

    const Description = `
        <div class="TextLabels">
            <span button>${Button}</span>
            <span class="Rating">${Document.Rating}</span>
            <div class="Tags">${Document.Tags.map(Tag => `<span>${Tag}</span>`).join("•")}</div>
        </div>
    `.replaceAll("\n", "");

    let BannerHideTimeout;

    Node.Hover(() => {
        Banner.style.display = "flex";
        setTimeout(() => Banner.style.opacity = 1, 250);

        const ShowDescription = () => {
            Banner.innerHTML = `
                <img src="${Document.Thumbnail}">
                ${Description}
            `.replaceAll("\n", "");
        };

        if (Time > 0) {
            Banner.innerHTML = `
                <video src="${Document.Series[0]}" playsinline></video>
                <img header src="${Document.Header}">
                ${Description}
            `.replaceAll("\n", "");

            const Video = Banner.querySelector("video");
            Video.currentTime = Time;
            Video.addEventListener("canplaythrough", () => Video.play(), { once: true });
            Video.load();
        } else {
            ShowDescription();
            const ShowVideo = () => {
                Banner.innerHTML = `
                    <video src="${Document.Series[0]}" playsinline></video>
                    <img header src="${Document.Header}">
                    ${Description}
                `.replaceAll("\n", "");

                const Video = Banner.querySelector("video");
                Video.addEventListener("canplaythrough", () => {
                    Video.play();
                    Video.addEventListener("ended", ShowDescription, { once: true });
                }, { once: true });
                Video.load();
            };
            Banner.querySelector("img").Hover(ShowVideo, 1250);
        }

        Banner.style.left = `${Node.offsetLeft}px`;
        Banner.style.top = `${Node.offsetTop}px`;

        Banner.querySelector("span[button]").addEventListener("click", () => {
            if (Time === 0) {
                const ContinueArray = JSON.parse(localStorage.getItem("Continue") || "[]");
                const Index = ContinueArray.findIndex(Item => Item[0] === Document.id);
                if (Index !== -1) ContinueArray[Index][1] = Time;
                else ContinueArray.push([Document.id, Time]);
                localStorage.setItem("Continue", JSON.stringify(ContinueArray));
            }
            Watch(Document.id, Document.Name, Document.Series, Time);
        });
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

    Node.addEventListener("click", () => {
        Tags = Tags.filter(String => String !== Node.innerText);
        Node.remove();
    });

    return Node;
}

await new FireStorage("Catalog").GetDocuments().then((Documents) => {
    let NewestDocument = Documents.reduce((A, B) => A.Timestamp > B.Timestamp ? A : B);
    Documents.forEach(Document => {
        const Node = CreateDocumentNode(Document, Document === NewestDocument);
        Discover.appendChild(Node);
    });

    const Continue = document.querySelector(".Continue");
    const ContinueArray = JSON.parse(localStorage.getItem("Continue") || "[]");

    ContinueArray.forEach(([Id, Time]) => {
        const Document = Documents.find(Document => Document.id === Id);
        if (!Document) return;
        const Node = CreateDocumentNode(Document, false, `Continue at ${FormatTime(Time)}`, Time);
        Continue.appendChild(Node);
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

    if (!Name || !Rating || !Header || !Thumbnail) return;

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