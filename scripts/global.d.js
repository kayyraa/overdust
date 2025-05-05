import * as Firebase from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import * as Firestore from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

globalThis.Firestore = Firestore;

globalThis.FirebaseConfig = {
    apiKey: "AIzaSyCn4Ph5OaQ8aCRvwznQqDH9LoCCjFoquyM",
    authDomain: "overdust-db1fd.firebaseapp.com",
    projectId: "overdust-db1fd",
    storageBucket: "overdust-db1fd.firebasestorage.app",
    messagingSenderId: "217602242472",
    appId: "1:217602242472:web:868a7098b141891ea34f9d"
};

globalThis.GithubStorageConfig = {
    Token: "",
    StorageOwner: "kayyraa",
    StorageName: "DirectStorage"
};

globalThis.App = Firebase.initializeApp(FirebaseConfig);
globalThis.Db = Firestore.getFirestore(App);

globalThis.Account = document.querySelector(".Account");
globalThis.Catalog = document.querySelector(".Catalog");
globalThis.Discover = document.querySelector(".Discover");
globalThis.Continue = document.querySelector(".Continue");

globalThis.Banner = document.querySelector(".Banner");
globalThis.Player = document.querySelector(".Player");
globalThis.Submission = document.querySelector(".Submission");
globalThis.SubmissionPanel = document.querySelector(".SubmissionPanel");

if (!localStorage.getItem("Continue")) localStorage.setItem("Continue", "[]");
globalThis.Time = 0

globalThis.GithubStorage = class {
    constructor(Document) {
        this.File = Document || null;
    }

    async Upload(Path = "") {
        if (!this.File) throw new Error("No file provided for upload.");
        const FileContent = await this.ReadFileAsBase64(this.File);

        const Url = `https://api.github.com/repos/${GithubStorageConfig.StorageOwner}/${GithubStorageConfig.StorageName}/contents/${Path}`;
        const Data = {
            message: "Upload file to repo",
            content: FileContent
        };

        const Response = await fetch(Url, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${GithubStorageConfig.Token}`,
                "Accept": "application/vnd.github.v3+json"
            },
            body: JSON.stringify(Data)
        });

        const Result = await Response.json();
        if (Response.ok) {
            console.log("File uploaded:", Result.content.html_url);
        } else {
            console.error("Upload failed:", Result);
        }
    }

    async Download(Path) {
        const Url = `https://api.github.com/repos/${GithubStorageConfig.StorageOwner}/${GithubStorageConfig.StorageName}/contents/${Path}`;

        const Response = await fetch(Url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${GithubStorageConfig.Token}`,
                "Accept": "application/vnd.github.v3+json"
            }
        });

        if (Response.ok) {
            const Result = await Response.json();
            const FileContent = atob(Result.content); // Decode Base64 content
            const Blob = new Blob([FileContent], { type: "application/octet-stream" });
            return new File([Blob], Path.split("/").pop(), { type: Blob.type });
        } else {
            const ErrorData = await Response.json();
            console.error("Failed to fetch file:", ErrorData);
            throw new Error(ErrorData.message || "File fetch failed");
        }
    }

    async ReadFileAsBase64(File) {
        return new Promise((Resolve, Reject) => {
            const Reader = new FileReader();
            Reader.onload = () => Resolve(Reader.result.split(",")[1]);
            Reader.onerror = Reject;
            Reader.readAsDataURL(File);
        });
    }
}

globalThis.FireStorage = class {
    constructor(Collection = "") {
        this.Collection = Collection;
    }

    async AppendDocument(DocumentData) {
        if (!this.Collection) return;
        const DocRef = await Firestore.addDoc(Firestore.collection(Db, this.Collection), DocumentData);
        return DocRef.id;
    }

    async GetDocument(DocumentId) {
        if (!this.Collection) return;
        const DocRef = Firestore.doc(Db, this.Collection, DocumentId);
        const Snapshot = await Firestore.getDoc(DocRef);

        if (Snapshot.exists()) return { id: Snapshot.id, ...Snapshot.data() };
        else return null;
    }

    async UpdateDocument(DocumentId, DocumentData) {
        if (!this.Collection) return;
        const DocRef = Firestore.doc(Db, this.Collection, DocumentId);
        await Firestore.updateDoc(DocRef, DocumentData);
    }

    async DeleteDocument(DocumentId) {
        if (!this.Collection) return;
        const DocRef = Firestore.doc(Db, this.Collection, DocumentId);
        await Firestore.deleteDoc(DocRef);
    }

    async GetDocuments(Query = {}) {
        if (!this.Collection) return;
        const CollectionRef = Firestore.collection(Db, this.Collection);
        let QueryRef = CollectionRef;
        Object.entries(Query).forEach(([Key, Value]) => {
            QueryRef = Firestore.query(QueryRef, Firestore.where(Key, "==", Value));
        });
        const QuerySnapshot = await Firestore.getDocs(QueryRef);
        return QuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async GetDocumentsByField(FieldName, FieldValue) {
        if (!this.Collection) return;
        const QueryRef = Firestore.query(
            Firestore.collection(Db, this.Collection),
            Firestore.where(FieldName, "==", FieldValue)
        );
        const QuerySnapshot = await Firestore.getDocs(QueryRef);
        return QuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async GetDocumentByFieldIncludes(FieldName, FieldValue) {
        if (!this.Collection) return;
        const QueryRef = Firestore.query(
            Firestore.collection(Db, this.Collection),
            Firestore.where(FieldName, ">=", FieldValue)
        );
        const QuerySnapshot = await Firestore.getDocs(QueryRef);
        return QuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    OnSnapshot(Callback) {
        if (!this.Collection) return;
        const CollectionRef = Firestore.collection(Db, this.Collection);
        Firestore.onSnapshot(CollectionRef, (Snapshot) => {
            Callback(Snapshot);
        });
    }
}

globalThis.Prompt = class {
    constructor(Prompt = { Title: "", Nodes: [] }, Style = ["", {}]) {
        this.Title = Prompt.Title;
        this.Nodes = Prompt.Nodes;
        this.Style = Style;
        this.Prompt = null;
    }

    Append() {
        const Prompt = document.createElement("div");
        Prompt.setAttribute("class", "Prompt");
        if (this.Style[0] === undefined || this.Style[0] === "self") Object.keys(this.Style[1]).forEach(Key => Prompt.style[Key] = this.Style[1][Key]);

        Prompt.innerHTML = `
            <div class="Topbar">
                <span>${this.Title}</span>
                <div button>X</div>
            </div>
            <div class="Content"></div>
        `;

        document.body.appendChild(Prompt);
        this.Prompt = Prompt;

        Prompt.setAttribute("style", `
            position: absolute;
            left: ${window.innerWidth / 2}px;
            top: ${window.innerHeight / 2}px;
        `);

        this.Style[0] ? this.Style[0] !== "self" ? Object.keys(this.Style[1]).forEach(Key => Prompt.querySelector(this.Style[0]).style[Key] = this.Style[1][Key]) : "" : "";
        Prompt.querySelector("div[button]").addEventListener("click", () => Prompt.remove());

        this.Nodes.forEach(Node => {
            if (!(Node instanceof HTMLElement)) return;
            this.Prompt.querySelector(".Content").appendChild(Node);
        });

        let Dragging = false;
        let StartX = 0;
        let StartY = 0;

        Prompt.querySelector(".Topbar").addEventListener("mousedown", (Event) => {
            Dragging = true;
            StartX = Event.clientX - parseInt(Prompt.style.left);
            StartY = Event.clientY - parseInt(Prompt.style.top);
        });

        document.addEventListener("mousemove", (Event) => {
            if (!Dragging) return;
            Prompt.style.left = `${Event.clientX - StartX}px`;
            Prompt.style.top = `${Event.clientY - StartY}px`;
        });

        document.addEventListener("mouseup", () => Dragging = false);

        return Prompt;
    }

    Remove() {
        if (!this.Prompt) return;
        this.Prompt.remove();
    }
}

globalThis.Format = class {
    constructor(Value) {
        this.Value = Value;
    }

    ConvertEpochToReadable(Pattern) {
        const NewDate = new Date(this.Value * 1000);
        const CurrentDate = new Date();

        const Hours = String(NewDate.getHours()).padStart(2, "0");
        const Minutes = String(NewDate.getMinutes()).padStart(2, "0");
        const Day = String(NewDate.getDate()).padStart(2, "0");
        const Month = String(NewDate.getMonth() + 1).padStart(2, "0");
        const Year = NewDate.getFullYear();

        const TimeDifference = CurrentDate - NewDate;
        const SecondsAgo = Math.floor(TimeDifference / 1000);
        const MinutesAgo = Math.floor(TimeDifference / (1000 * 60));
        const HoursAgo = Math.floor(TimeDifference / (1000 * 60 * 60));
        const DaysAgo = Math.floor(TimeDifference / (1000 * 60 * 60 * 24));
        const MonthsAgo = Math.floor(TimeDifference / (1000 * 60 * 60 * 24 * 30));
        const YearsAgo = Math.floor(TimeDifference / (1000 * 60 * 60 * 24 * 30 * 365));

        const MonthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];

        const MonthName = MonthNames[NewDate.getMonth()];

        const Selectors = {
            "ss": SecondsAgo,
            "mm": MinutesAgo,
            "hh": HoursAgo,
            "dd": DaysAgo,
            "mo": MonthsAgo,
            "yy": YearsAgo
        }

        if (Pattern.split(" ").find(Now => Now.startsWith("&now")) &&
            Selectors[Pattern.split(" ").find(Now => Now.startsWith("&now")).split(":")[1]] <= parseInt(Pattern.split(" ").find(Now => Now.startsWith("&now")).split(":")[2])) return "now";

        if (Pattern.replace(Pattern.split(" ").find(Now => Now.startsWith("&now")), "").trim() === "hh and mm ago" && HoursAgo === 0) return `${MinutesAgo} minute${MinutesAgo > 1 ? "s" : ""} ago`;
        if (Pattern.replace(Pattern.split(" ").find(Now => Now.startsWith("&now")), "").trim() === "hh and mm ago" && HoursAgo >= 24 * 7) return `${(DaysAgo % 7) + 1} week${DaysAgo % 7 > 1 ? "s" : ""} ago`;
        if (Pattern.replace(Pattern.split(" ").find(Now => Now.startsWith("&now")), "").trim() === "hh and mm ago" && HoursAgo >= 24) return `${DaysAgo} day${DaysAgo > 1 ? "s" : ""} ago`;
        if (Pattern.replace(Pattern.split(" ").find(Now => Now.startsWith("&now")), "").trim() === "hh and mm ago" && HoursAgo >= 24 * 30) return `${MonthsAgo} months${MonthsAgo > 1 ? "s" : ""} ago`;
        if (Pattern.replace(Pattern.split(" ").find(Now => Now.startsWith("&now")), "").trim() === "hh and mm ago" && HoursAgo >= 24 * 30 * 12) return `${YearsAgo} year${YearsAgo > 1 ? "s" : ""} ago`;

        const Patterns = {
            "hh:mm:ss dd.mm.yyyy": `${Hours}:${Minutes}:${String(NewDate.getSeconds()).padStart(2, "0")} ${Day}.${Month}.${Year}`,
            "hh:mm:ss dd/mm/yyyy": `${Hours}:${Minutes}:${String(NewDate.getSeconds()).padStart(2, "0")} ${Day}/${Month}/${Year}`,
            "hh:mm:ss mm.yyyy": `${Hours}:${Minutes}:${String(NewDate.getSeconds()).padStart(2, "0")} ${Month}.${Year}`,
            "hh:mm:ss mm/yyyy": `${Hours}:${Minutes}:${String(NewDate.getSeconds()).padStart(2, "0")} ${Month}/${Year}`,
            "hh:mm:ss": `${Hours}:${Minutes}:${String(NewDate.getSeconds()).padStart(2, "0")}`,
            "hh:mm dd.mm.yyyy": `${Hours}:${Minutes} ${Day}.${Month}.${Year}`,
            "hh:mm dd/mm/yyyy": `${Hours}:${Minutes} ${Day}/${Month}/${Year}`,
            "hh:mm mm.yyyy": `${Hours}:${Minutes} ${Month}.${Year}`,
            "hh:mm mm/yyyy": `${Hours}:${Minutes} ${Month}/${Year}`,
            "hh:mm yyyy": `${Hours}:${Minutes} ${Year}`,
            "hh:mm": `${Hours}:${Minutes}`,
            "mm:ss": `${Minutes}:${String(NewDate.getSeconds()).padStart(2, "0")}`,
            "dd.mm.yyyy": `${Day}.${Month}.${Year}`,
            "dd/mm/yyyy": `${Day}/${Month}/${Year}`,
            "mm.yyyy": `${Month}.${Year}`,
            "mm/yyyy": `${Month}/${Year}`,
            "dd mn": `${Day} ${MonthName}`,
            "hh:mm dd mn": `${Hours}:${Minutes} ${Day} ${MonthName}`,
            "yyyy": `${Year}`,
            "mm ago": `${MinutesAgo} minutes ago`,
            "hh ago": `${HoursAgo} hours ago`,
            "dd ago": `${DaysAgo} days ago`,
            "hh and mm ago": `${HoursAgo} hours and ${MinutesAgo % 60} minutes ago`,
            "hh and mm and yyyy ago": `${HoursAgo} hours, ${MinutesAgo % 60} minutes, and ${Year} years ago`,
            "dd hh and mm and yyyy ago": `${DaysAgo} days, ${HoursAgo % 24} hours, ${MinutesAgo % 60} minutes, and ${Year} years ago`,
        };

        return Patterns[Pattern.replace(Pattern.split(" ").find(Now => Now.startsWith("&now")), "").trim()] || "";
    }
}

globalThis.FormatTime = (Seconds) => {
    const Hour = String(Math.floor(Seconds / 3600)).padStart(2, "0");
    const Minute = String(Math.floor((Seconds % 3600) / 60)).padStart(2, "0");
    const Second = String(Math.floor(Seconds % 60)).padStart(2, "0");
    return `${Hour}:${Minute}:${Second}`;
};

globalThis.TruncateString = (String, Length, Suffix) => String.length > Length ? `${String.slice(0, Length)}${Suffix}` : String;

globalThis.Uuid = (Length = 16) => {
    if ((Length & (Length - 1)) !== 0 || Length < 2) return "";

    return Array.from({ length: Length }, () =>
        Math.floor(Math.random() * 16).toString(16)
    ).reduce((Acc, Char, Index) =>
        Acc + (Index && Index % (Length / 2) === 0 ? "-" : "") + Char, ""
    );
};

Element.prototype.Hover = function (CallbackFunction, TimeoutDuration = 500) {
    let IsHeld = false;
    let ActiveHoldTimeout = null;

    const OnHoverStart = (Event) => {
        if (Event.button === 2) return;
        IsHeld = true;
        ActiveHoldTimeout = setTimeout(() => {
            if (IsHeld) {
                CallbackFunction(Event);
                IsHeld = false;
            }
        }, TimeoutDuration);
    };

    const OnHoverEnd = () => {
        IsHeld = false;
        clearTimeout(ActiveHoldTimeout);
    };

    this.addEventListener("mouseenter", OnHoverStart, { passive: false });
    this.addEventListener("mouseleave", OnHoverEnd, { passive: false });

    return this;
};

const SaveProgress = () => {
    if (!Series || !Series.length) return;

    const ContinueArray = JSON.parse(localStorage.getItem("Continue") || "[]");
    const IndexInArray = ContinueArray.findIndex(Item => Item[0] === Name);

    if (IndexInArray !== -1) {
        ContinueArray[IndexInArray][1] = VideoNode.currentTime;
    } else {
        ContinueArray.push([Name, VideoNode.currentTime]);
    }

    localStorage.setItem("Continue", JSON.stringify(ContinueArray));
};

globalThis.Watch = (Id, Name, Series, Time = 0) => {
    document.body.style.overflow = "hidden";

    Player.style.display = "";
    setTimeout(() => Player.style.opacity = 1, 250);

    const Playback = Player.querySelector(".Playback");
    const VideoNode = Player.querySelector("video");
    const ReturnButton = Player.querySelector(".ReturnButton");

    let Index = 0;
    let Dragging = false;

    ReturnButton.addEventListener("click", (Event) => {
        Event.preventDefault();
        Player.style.opacity = 0;
        setTimeout(() => Player.style.display = "none", 250);
        VideoNode.pause();
        VideoNode.setAttribute("src", Series[Index]);
        VideoNode.load();
        VideoNode.currentTime = Time;
        document.body.style.overflow = "";
    });

    const PlayCurrent = () => {
        if (Index >= Series.length) {
            VideoNode.onended = null;
            VideoNode.ontimeupdate = null;
            setTimeout(() => {
                Player.style.opacity = 0;
                setTimeout(() => Player.style.display = "none", 250);
                document.body.style.overflow = "";
                VideoNode.pause();
            }, 500);
            return;
        }

        VideoNode.setAttribute("src", Series[Index]);
        VideoNode.load();

        Playback.querySelector(".Title").innerHTML = `${Name} • ${Index + 1} / ${Series.length}`;

        VideoNode.addEventListener("canplaythrough", () => VideoNode.play());

        VideoNode.onended = () => {
            Index++;
            PlayCurrent();
        };

        let LastSavedTime = -999;
        VideoNode.ontimeupdate = () => {
            if (!VideoNode.duration || Dragging) return;

            const Percent = (VideoNode.currentTime / VideoNode.duration) * 100;
            const Remaining = VideoNode.duration - VideoNode.currentTime;

            Playback.querySelector(".Bar > .Value").style.width = `${Percent}%`;
            Playback.querySelector(".Bar > .Cursor").style.left = `${Percent}%`;
            Playback.querySelector(".Time").innerHTML = FormatTime(Remaining);

            globalThis.Time = VideoNode.currentTime;

            const ContinueArray = JSON.parse(localStorage.getItem("Continue") || "[]");
            const Existing = ContinueArray.find(Item => Item[0] === Id);
            if (Existing) {
                Existing[1] = VideoNode.currentTime;
            } else {
                ContinueArray.push([Id, VideoNode.currentTime]);
            }
            localStorage.setItem("Continue", JSON.stringify(ContinueArray));

            if (Math.abs(VideoNode.currentTime - LastSavedTime) >= 5) {
                LastSavedTime = VideoNode.currentTime;

                const ContinueArray = JSON.parse(localStorage.getItem("Continue") || "[]");
                const Existing = ContinueArray.find(Item => Item[0] === Name);
                if (Existing) {
                    Existing[1] = VideoNode.currentTime;
                } else {
                    ContinueArray.push([Name, VideoNode.currentTime]);
                }
                localStorage.setItem("Continue", JSON.stringify(ContinueArray));
            }
        };

        const Bar = Playback.querySelector(".Bar");
        const Cursor = Playback.querySelector(".Cursor");

        const SeekTo = (ClientX) => {
            const Rect = Bar.getBoundingClientRect();
            const X = Math.max(0, Math.min(ClientX - Rect.left, Rect.width));
            const Percent = X / Rect.width;
            VideoNode.currentTime = VideoNode.duration * Percent;
        };

        Cursor.onmousedown = (Event) => {
            Event.preventDefault();
            Dragging = true;
            document.body.style.userSelect = "none";
        };

        document.onmousemove = (Event) => {
            if (Dragging) SeekTo(Event.clientX);
        };

        document.onmouseup = (Event) => {
            if (Dragging) {
                SeekTo(Event.clientX);
                Dragging = false;
                document.body.style.userSelect = "";
            }
        };

        Bar.onclick = (Event) => {
            SeekTo(Event.clientX);
        };
    };

    PlayCurrent();
};

globalThis.SubmitSubmission = () => {
    document.body.style.overflow = "hidden";

    Player.style.opacity = 0;
    setTimeout(() => Player.style.display = "none", 250);

    SubmissionPanel.style.display = "";
    setTimeout(() => SubmissionPanel.style.opacity = 1, 250);

    const ReturnButton = SubmissionPanel.querySelector(".ReturnButton");
    ReturnButton.addEventListener("click", (Event) => {
        Event.preventDefault();
        SubmissionPanel.style.opacity = 0;
        setTimeout(() => SubmissionPanel.style.display = "none", 250);
        document.body.style.overflow = "";
    });
}

GithubStorageConfig.Token = await new FireStorage("Secrets").GetDocument("Token").then((Document) => Document.Value);