const mainWrapper = document.getElementById("main");
LinkBtnNum = 1;
let lastScrollTop = 0;
const nav = document.getElementById('nav-toolbar');

document.addEventListener('DOMContentLoaded', () => {
    const { profile, SEO, links, display } = setting;
    const { music } = display.share;
    const titlesetting = setting.display.title;
    Profile(profile, music, display, SEO, titlesetting);
    Links(links);

    if (!display.blur) {
        document.body.style.setProperty('--global-blur', 'blur(0)');
    } else {
        document.body.style.setProperty('--global-blur', 'blur(50px)');
    }

    document.documentElement.setAttribute('theme', display.theme || 'classic');

    setTimeout(() => {
        document.getElementById('preloader').style.animation = "fadeOut 0.8s cubic-bezier(0.75, 0.15, 0.16, 0.99) forwards";
        document.getElementById('background').style.animation = "bgFadeIn 1.9s cubic-bezier(0.25, 0.04, 0, 0.89) forwards";
        setTimeout(() => {
            document.getElementById('preloader').remove();
        }, 1000);
    }, 1500);

    const pages = document.querySelectorAll('.page');
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const pageName = entry.target.getAttribute('p-name');
                    if (pageName) {
                        document.title = `${pageName} | ${setting.profile.website_name}`;
                    }
                }
            });
        },
        {
            root: mainWrapper,
            threshold: [0.3],
        }
    );

    pages.forEach((page) => observer.observe(page));
});

function createLink(icon, target, url, linkName, onclick) {
    const LinkBtnWrapper = document.createElement('a');

    LinkBtnWrapper.id = `link_${LinkBtnNum++}`;
    LinkBtnWrapper.target = target;
    LinkBtnWrapper.title = linkName;

    if (url != false) {
        LinkBtnWrapper.href = url;
    }

    if (onclick) {
        LinkBtnWrapper.onclick = (e) => {
            e.preventDefault();
            new Function(onclick)();
        };
    }

    const LinkInfoTab = document.createElement('div');
    const LinkBtnIcon = document.createElement('i');
    const LinkBtnTitle = document.createElement('div');
    LinkInfoTab.className = 'link-info-tab';
    LinkBtnWrapper.className = 'link-btn-box';

    LinkBtnTitle.innerText = linkName;
    LinkBtnTitle.className = 'link-title';
    LinkInfoTab.appendChild(LinkBtnIcon);
    LinkInfoTab.appendChild(LinkBtnTitle);
    LinkBtnWrapper.appendChild(LinkInfoTab);

    if (icon.type === "fontawesome") {
        LinkBtnIcon.className = `link-icon ${icon.fontawesome}`;
    } else if (icon.type === "auto") {
        if (icon.fontawesome) {
            LinkBtnIcon.className = `link-icon ${icon.fontawesome}`;
        } else {
            LinkBtnIcon.className = "link-icon-text";
            LinkBtnIcon.innerText = linkName.charAt(0).toUpperCase()
        }
    }

    LinkBtnWrapper.setAttribute('l-name', linkName);
    return LinkBtnWrapper;
}

function greetUser(greet) {
    const currentHour = new Date().getHours();
    const greetings = {
        morning: greet.morning || "Good morning!",
        afternoon: greet.afternoon || "Good afternoon!",
        evening: greet.evening || "Good evening!",
        night: greet.night || "Good night!"
    };

    if (currentHour >= 6 && currentHour < 12) {
        return greetings.morning;
    } else if (currentHour >= 12 && currentHour < 18) {
        return greetings.afternoon;
    } else if (currentHour >= 18 && currentHour < 21) {
        return greetings.evening;
    } else {
        return greetings.night;
    }
}

function Profile(profile, music, display, SEO, titlesetting) {
    const { icon, favicon } = profile;
    const { background, nav } = display;
    const { language, description, google_verification } = SEO;
    const { music_data: musicSetting } = music;

    /* Basic HTML Elements */
    document.documentElement.lang = language || 'en';
    document.title = profile.website_name;
    document.getElementById('title').innerText = titlesetting.method === "greeting" ? greetUser(titlesetting.advanced_setting) : `HEY! ${profile.name}`;
    document.getElementById('description').innerText = profile.subtitle;

    /* Meta Tags */
    document.querySelector('meta[name="description"]')?.setAttribute('content', description || 'Powered by JerryIs-strong/Arona');
    document.querySelector('meta[name="google-site-verification"]')?.setAttribute('content', google_verification || '');
    if (favicon.default) {
        document.querySelector("link[rel='shortcut icon']").href = favicon.default;
        document.querySelector("link[rel='apple-touch-icon']").href = favicon.default;
    }

    Music(music, musicSetting);
    Background(background.url);
    HolderIcon(icon);
    NavLink(nav);
}

function Music(music, musicSetting) {
    const musicElement = document.getElementById('MusicName');
    if (music.enable) {
        const musicNumber = Object.keys(musicSetting).length;
        const musicRandom = Math.floor(Math.random() * musicNumber);
        const musicKey = musicSetting[musicRandom];
        musicElement.innerText = musicKey.name;
        musicElement.href = musicKey.url;
        if (musicKey.album || musicKey.artist) {
            if (musicKey.album.length > 0) {
                var musicKeyName = `${musicKey.name} - ${musicKey.artist} • ${musicKey.album}`;
            } else {
                var musicKeyName = `${musicKey.name} - ${musicKey.artist}`;
            }
        }
        musicElement.innerText = musicKeyName;
        musicElement.title = musicKeyName;
        const currentMusic = {
            name: musicKey.name,
            artist: musicKey.artist
        }
        sessionStorage.setItem('current-music', JSON.stringify(currentMusic));
    } else {
        debug("Music function is disabled", "info")
        document.getElementById('music').remove();
    }
}

function NavLink(links) {
    const navElement = document.getElementById("nav");
    const pages = document.querySelectorAll('.page');

    pages.forEach((page) => {
        const pageName = page.getAttribute('p-name');
        
        const navLinkWrapper = document.createElement("div");
        navLinkWrapper.classList.add('nav-item');
        navLinkWrapper.innerText = pageName;

        const navLinkIcon = document.createElement("span");
        navLinkIcon.classList.add('material-symbols-outlined', 'nav-icon');
        navLinkIcon.innerText = links.custome_page_icon[pageName] || '';
        navLinkWrapper.appendChild(navLinkIcon);

        navLinkWrapper.onclick = () => navigateTo(pageName);
        navElement.appendChild(navLinkWrapper);
    });

    Object.entries(links.external_link).forEach(([linkDB, link]) => {
        const navElinkWrapper = document.createElement("div");
        navElinkWrapper.classList.add('nav-item', 'nav-elink');

        navElinkWrapper.innerText = link.name.includes("I: ") 
            ? link.name.split("I: ")[1] 
            : `${link.name} 🔗`;

        if (link.icon) {
            let navElinkIcon;
            if (link.icon.includes("/")) {
                navElinkIcon = document.createElement("img");
                navElinkIcon.classList.add('nav-icon', 'img-icon');
                navElinkIcon.src = link.icon;
            } else {
                navElinkIcon = document.createElement("span");
                navElinkIcon.classList.add('material-symbols-outlined', 'nav-icon');
                navElinkIcon.innerText = link.icon;
            }
            navElinkWrapper.appendChild(navElinkIcon);
        }

        navElinkWrapper.onclick = () => window.open(link.url, '_blank'); // Use arrow function for consistency
        navElement.appendChild(navElinkWrapper);
    });
}

function Background(backgroundUrl) {
    const backgroundElement = document.getElementById('background');
    if (backgroundUrl.length > 0 && backgroundUrl.includes('/')) {
        backgroundElement.style.backgroundImage = `url(${backgroundUrl})`;
    } else {
        debug("Local wallpaper setting error", "warn");
        document.getElementById('background').remove();
    }
}

function HolderIcon(holderIcon) {
    const imgElement = document.getElementById('img');
    if (holderIcon.url) {
        imgElement.src = holderIcon.url;
    } else {
        debug("Profile picture setting error", "warn");
        document.getElementById('img').remove();
    }
}

function Links(linksetting) {
    const urlParams = new URLSearchParams(window.location.search);
    const linkGroup = document.getElementById('mediaBtn_wrapper');

    if (linksetting && Object.keys(linksetting).length > 0) {
        Object.entries(linksetting).forEach(([linkDB]) => {
            link = linksetting[linkDB];
            if (link.enable && link.name != urlParams.get('media')) {
                linkGroup.appendChild(createLink(link.icon, link.target, link.url, link.name, false));
            }
        });
    } else {
        debug("Link settings error", "warn");
        linkGroup.remove();
    }
}

function navigateTo(pageName) {
    const mainWrapper = document.getElementById('main');
    const targetPage = document.querySelector(`.page[p-name="${pageName}"]`);

    if (targetPage) {
        mainWrapper.scrollTo({
            top: targetPage.offsetTop - mainWrapper.offsetTop, // Adjust for wrapper offset
            behavior: 'smooth',
        });
    } else {
        console.error(`Page with name "${pageName}" not found.`);
    }

    document.getElementById('nav').classList.remove('open');
}

function toggleNav(isOpen) {
    const nav = document.getElementById('nav');
    const openBtn = document.getElementById('navOpenBtn');
    
    if (isOpen) {
        nav.classList.add('open');
        if (openBtn) openBtn.classList.add('active');
    } else {
        nav.classList.remove('open');
        if (openBtn) openBtn.classList.remove('active');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const navElement = document.getElementById('nav');
    
    // Auto-close nav when clicking on nav items
    if (navElement) {
        const navItems = navElement.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                toggleNav(false);
            });
        });
    }
});