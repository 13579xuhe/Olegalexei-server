// ==================== 语言切换功能 ====================

let currentLanguage = 'zh'; // 默认中文

// 初始化语言切换
function initLanguageToggle() {
    const languageToggle = document.getElementById('languageToggle');
    if (!languageToggle) return;

    // 从本地存储获取语言设置
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
        currentLanguage = savedLanguage;
    }

    // 设置初始语言
    updateLanguage();

    // 添加点击事件
    languageToggle.addEventListener('click', toggleLanguage);
}

// 切换语言
function toggleLanguage() {
    currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
    localStorage.setItem('language', currentLanguage);
    updateLanguage();
    updateLanguageButton();
}

// 更新页面语言
function updateLanguage() {
    const elements = document.querySelectorAll('[data-zh], [data-en]');

    elements.forEach(element => {
        const text = element.getAttribute(`data-${currentLanguage}`);
        if (text) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = text;
            } else {
                // 处理包含HTML的情况
                if (text.includes('<span>')) {
                    element.innerHTML = text;
                } else {
                    element.textContent = text;
                }
            }
        }
    });

    // 专门处理占位符属性
    const inputs = document.querySelectorAll('input[data-zh-placeholder], textarea[data-zh-placeholder]');
    inputs.forEach(input => {
        const placeholder = input.getAttribute(`data-${currentLanguage}-placeholder`);
        if (placeholder) {
            input.placeholder = placeholder;
        }
    });

    // 更新列表项
    const listItems = document.querySelectorAll('li[data-zh], li[data-en]');
    listItems.forEach(item => {
        const text = item.getAttribute(`data-${currentLanguage}`);
        if (text) {
            item.textContent = text;
        }
    });
}

// 更新语言按钮文本
function updateLanguageButton() {
    const languageToggle = document.getElementById('languageToggle');
    if (languageToggle) {
        languageToggle.textContent = currentLanguage === 'zh' ? 'Switch to English' : '切换为中文';
    }
}

// ==================== 全局变量 ====================
let currentTrackIndex = 0;
let isPlaying = false;
let audioElement = null;

// 音乐数据
const musicData = [
    {
        id: 1,
        title: "NOT RUN!!!",
        artist: "Olegalexei＆KR_C",
        genre: "Xtra Raw",
        year: "2025",
        audioUrl: "./music/NOT RUN!!!/NOT RUN!!!.mp3",
        imageUrl: "./music/NOT RUN!!!/NOT RUN!!!.jpg"
    },
    {
        id: 2,
        title: "BLACKIN NOW",
        artist: "Olegalexei",
        genre: "Xtra Raw",
        year: "2025",
        audioUrl: "./music/Blackin Now/Blackin Now.mp3",
        imageUrl: "./music/Blackin Now/Blackin Now.jpg"
    },
    {
        id: 3,
        title: "CHANGE",
        artist: "Olegalexei",
        genre: "Hardbass",
        year: "2025",
        audioUrl: "./music/CHANGE/CHANGE.mp3",
        imageUrl: "./music/CHANGE/CHANGE.jpg"
    }
];

// ==================== 页面滚动和导航功能 ====================

// 滚动到指定章节
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });

        updateActiveNavLink(sectionId);
    }
}

// 更新活动导航链接
function updateActiveNavLink(activeSection) {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${activeSection}`) {
            link.classList.add('active');
        }
    });
}

// ==================== 音乐播放器功能 ====================

// 初始化音乐播放器
function initMusicPlayer() {
    audioElement = new Audio();

    // 设置音频事件监听器
    audioElement.addEventListener('loadedmetadata', updateProgressBar);
    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('ended', playNextTrack);

    // 初始化控制
    setupPlayerControls();
    setupVolumeControl();

    // 加载第一首歌曲
    loadTrack(currentTrackIndex);

    // 设置曲目卡片点击事件
    setupTrackCards();
}

// 加载指定索引的歌曲
function loadTrack(trackIndex) {
    if (trackIndex < 0 || trackIndex >= musicData.length) return;

    currentTrackIndex = trackIndex;
    const track = musicData[trackIndex];

    // 更新音频源
    audioElement.src = track.audioUrl;

    // 更新播放器显示
    updatePlayerDisplay(track, trackIndex);

    // 预加载下一首
    preloadNextTrack();
}

// 更新播放器显示
function updatePlayerDisplay(track, trackIndex) {
    const trackCover = document.querySelector('.track-cover');
    const trackTitle = document.querySelector('.track-details h4');
    const trackArtist = document.querySelector('.track-details p');

    // 设置背景图片
    trackCover.style.backgroundImage = `url('${track.imageUrl}')`;
    trackCover.style.backgroundSize = 'cover';
    trackCover.style.backgroundPosition = 'center';

    trackTitle.textContent = track.title;
    trackArtist.textContent = track.artist;

    // 更新曲目卡片状态
    updateTrackCardsState(trackIndex);
}

// 更新曲目卡片播放状态
function updateTrackCardsState(currentTrackIndex) {
    const trackCards = document.querySelectorAll('.track-card');
    const playIcons = document.querySelectorAll('.track-card .play-track .icon-play');

    trackCards.forEach((card, index) => {
        if (index === currentTrackIndex && isPlaying) {
            card.classList.add('playing');
            if (playIcons[index]) {
                playIcons[index].innerHTML = '<use xlink:href="#icon-pause"></use>';
            }
        } else {
            card.classList.remove('playing');
            if (playIcons[index]) {
                playIcons[index].innerHTML = '<use xlink:href="#icon-play"></use>';
            }
        }
    });
}

// 设置播放器控制
function setupPlayerControls() {
    const playBtn = document.querySelector('.play-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const progressBar = document.querySelector('.progress-bar');

    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', playPreviousTrack);
    nextBtn.addEventListener('click', playNextTrack);
    progressBar.addEventListener('click', seekAudio);
}

// 设置音量控制
function setupVolumeControl() {
    const volumeSlider = document.querySelector('.volume-slider');
    const volumeBtn = document.querySelector('.volume-btn');

    if (!volumeSlider || !volumeBtn) return;

    // 设置初始音量
    audioElement.volume = volumeSlider.value / 100;

    // 音量滑块事件
    volumeSlider.addEventListener('input', function() {
        audioElement.volume = this.value / 100;
    });

    // 音量按钮静音/取消静音
    volumeBtn.addEventListener('click', function() {
        if (audioElement.volume > 0) {
            audioElement.volume = 0;
            volumeSlider.value = 0;
        } else {
            audioElement.volume = 0.5;
            volumeSlider.value = 50;
        }
    });
}

// 设置曲目卡片点击事件
function setupTrackCards() {
    const trackCards = document.querySelectorAll('.track-card');

    trackCards.forEach((card, index) => {
        const playBtn = card.querySelector('.play-track');

        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playTrackFromCard(index);
        });

        // 点击整个卡片也可以播放
        card.addEventListener('click', () => {
            playTrackFromCard(index);
        });
    });
}

// 从卡片播放歌曲 - 修复版本
function playTrackFromCard(trackIndex) {
    // 如果点击的是当前正在播放的曲目
    if (trackIndex === currentTrackIndex) {
        if (isPlaying) {
            // 如果正在播放，则暂停
            pauseAudio();
        } else {
            // 如果已暂停，则继续播放
            playAudio();
        }
    } else {
        // 如果点击的是其他曲目，加载并播放新曲目
        loadTrack(trackIndex);
        playAudio();
    }
}

// 播放/暂停切换
function togglePlay() {
    if (isPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
}

// 播放音频
function playAudio() {
    audioElement.play().then(() => {
        isPlaying = true;
        updatePlayButton();
        updateTrackCardsState(currentTrackIndex);
    }).catch(error => {
        console.error('播放失败:', error);
        showPlaybackError();
    });
}

// 暂停音频
function pauseAudio() {
    audioElement.pause();
    isPlaying = false;
    updatePlayButton();
    updateTrackCardsState(currentTrackIndex);
}

// 播放下一首
function playNextTrack() {
    const nextIndex = (currentTrackIndex + 1) % musicData.length;
    loadTrack(nextIndex);
    if (isPlaying) {
        playAudio();
    }
}

// 播放上一首
function playPreviousTrack() {
    const prevIndex = (currentTrackIndex - 1 + musicData.length) % musicData.length;
    loadTrack(prevIndex);
    if (isPlaying) {
        playAudio();
    }
}

// 更新播放按钮状态
function updatePlayButton() {
    const playBtn = document.querySelector('.play-btn');
    const playIcon = playBtn.querySelector('.icon-play');
    const pauseIcon = playBtn.querySelector('.icon-pause');

    if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
}

// 更新进度条和时间显示
function updateProgress() {
    const progress = document.querySelector('.progress');
    const currentTimeEl = document.querySelector('.current-time');
    const durationEl = document.querySelector('.duration');

    const currentTime = audioElement.currentTime;
    const duration = audioElement.duration;

    // 更新进度条
    if (duration > 0) {
        const percentage = (currentTime / duration) * 100;
        progress.style.width = `${percentage}%`;
    }

    // 更新时间显示
    if (currentTimeEl) currentTimeEl.textContent = formatTime(currentTime);
    if (durationEl) durationEl.textContent = formatTime(duration);
}

// 格式化时间 (秒 -> 分:秒)
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// 点击进度条跳转
function seekAudio(e) {
    const progressBar = e.currentTarget;
    const clickPosition = e.offsetX;
    const progressBarWidth = progressBar.offsetWidth;
    const percentage = clickPosition / progressBarWidth;

    audioElement.currentTime = percentage * audioElement.duration;
}

// 更新进度条最大值
function updateProgressBar() {
    const durationEl = document.querySelector('.duration');
    if (durationEl) {
        durationEl.textContent = formatTime(audioElement.duration);
    }
}

// 预加载下一首歌曲
function preloadNextTrack() {
    const nextIndex = (currentTrackIndex + 1) % musicData.length;
    const nextTrack = musicData[nextIndex];
    const preloadAudio = new Audio();
    preloadAudio.src = nextTrack.audioUrl;
}

// 显示播放错误
function showPlaybackError() {
    console.log('音频播放失败，请检查文件路径或网络连接');
}

// ==================== 联系表单功能 ====================

// 处理表单提交 - 打开邮件客户端
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;

        // 显示提示信息
        const messageDiv = document.getElementById('formMessage');
        messageDiv.style.display = 'block';

        // 构建邮件内容
        const mailBody = `尊敬的Olegalexei，

我是${name}，我的联系邮箱是：${email}

${message}

期待您的回复！

祝好，
${name}`;

        // 构建mailto链接
        const mailtoLink = `mailto:olegalexei987@163.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;

        // 延迟打开邮件客户端
        setTimeout(() => {
            window.location.href = mailtoLink;
        }, 500);

        // 3秒后隐藏提示
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    });
}

// 直接打开空邮件
function openEmptyEmail() {
    const messageDiv = document.getElementById('formMessage');
    messageDiv.textContent = "正在打开邮件客户端...";
    messageDiv.style.display = 'block';

    setTimeout(() => {
        window.location.href = 'mailto:olegalexei987@163.com';
    }, 500);

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

// ==================== 复制功能 ====================

// 通用复制函数 - 修复版本
function copyToClipboard(text, buttonElement) {
    // 保存原始HTML内容
    const originalHTML = buttonElement.innerHTML;

    navigator.clipboard.writeText(text).then(() => {
        // 根据当前语言显示成功消息
        const successText = currentLanguage === 'zh' ? '已复制' : 'Copied';

        // 更新按钮内容
        buttonElement.innerHTML = '<svg class="icon icon-copy" style="width: 12px; height: 12px; margin-right: 5px;"><use xlink:href="#icon-copy"></use></svg> ' + successText;
        buttonElement.style.background = '#28a745';
        buttonElement.style.color = 'white';

        // 2秒后恢复原始状态
        setTimeout(() => {
            buttonElement.innerHTML = originalHTML;
            buttonElement.style.background = '';
            buttonElement.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('复制失败:', err);
        // 根据当前语言显示错误消息
        const errorText = currentLanguage === 'zh' ? '复制失败，请手动复制' : 'Copy failed, please copy manually';
        alert(errorText);
    });
}

// 复制邮箱 - 修复版本
function copyEmail(event) {
    // 确保我们获取的是按钮元素
    const button = event.target.closest('button');
    if (button) {
        copyToClipboard('olegalexei987@163.com', button);
    }
}

// 复制QQ - 修复版本
function copyQQ(event) {
    // 确保我们获取的是按钮元素
    const button = event.target.closest('button');
    if (button) {
        copyToClipboard('2722650338', button);
    }
}

// ==================== 背景效果 ====================

// 背景图片跟随滚动效果
function initBackgroundParallax() {
    const background = document.querySelector('.background-image');
    if (!background) return;

    const scrollSpeed = 0.3;

    function updateBackgroundPosition() {
        const scrolled = window.pageYOffset;
        const backgroundPosition = -scrolled * scrollSpeed;
        background.style.transform = `translateY(${backgroundPosition}px)`;
    }

    let ticking = false;
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateBackgroundPosition();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll);
    updateBackgroundPosition();
}

// ==================== 事件监听器 ====================

// 监听滚动事件，更新活动导航链接
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('.page-section');
    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    if (currentSection) {
        updateActiveNavLink(currentSection);
    }
});

// ==================== 页面初始化 ====================

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化导航链接
    const navLinks = document.querySelectorAll('.nav-links a, .footer-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                const sectionId = href.substring(1);
                scrollToSection(sectionId);
            }
        });
    });

    // 初始化活动导航链接
    updateActiveNavLink('section1');

    // 初始化联系表单
    setupContactForm();

    // 初始化音乐播放器
    initMusicPlayer();

    // 初始化背景跟随效果
    initBackgroundParallax();

    // 初始化语言切换
    initLanguageToggle();

    // 检查EmailJS
    if (typeof emailjs === 'undefined') {
        console.log('EmailJS未加载，使用备用邮件方案');
    }
});