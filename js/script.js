// 初始化手风琴功能 - 默认全部闭合
function initAccordion() {
  // 获取所有手风琴标题
  const accordionHeaders = document.querySelectorAll(".accordion-header");
  const accordionContents = document.querySelectorAll(".accordion-content");

  // 默认全部闭合
  accordionHeaders.forEach((header) => {
    header.classList.remove("active");
    const icon = header.querySelector("i");
    if (icon) icon.style.transform = "rotate(0deg)";
  });

  accordionContents.forEach((content) => {
    content.classList.remove("show");
    content.style.maxHeight = "0";
  });

  // 为所有手风琴标题添加点击事件
  accordionHeaders.forEach((header) => {
    header.addEventListener("click", function () {
      const content = this.nextElementSibling;
      const isActive = this.classList.contains("active");
      const icon = this.querySelector("i");

      // 切换当前手风琴状态
      if (isActive) {
        this.classList.remove("active");
        if (content) {
          content.classList.remove("show");
          content.style.maxHeight = "0";
        }
        if (icon) icon.style.transform = "rotate(0deg)";
      } else {
        this.classList.add("active");
        if (content) {
          // 通过判断图标的变换角度展开
          content.classList.add("show");
          content.style.maxHeight = content.scrollHeight + "px";
        }
        if (icon) icon.style.transform = "rotate(90deg)";
      }
    });
  });
}

// 初始化角色选择功能
function initCharacterSelection() {
  const characterItems = document.querySelectorAll(".character-list li");
  const characterContents = document.querySelectorAll(
    ".character-content, .movie-card, .character-card"
  );

  // 添加点击事件
  characterItems.forEach((item) => {
    item.addEventListener("click", function () {
      // 移除所有列表项的active类
      characterItems.forEach((li) => li.classList.remove("active"));

      // 给当前点击项添加active类
      this.classList.add("active");

      // 获取目标ID
      const targetId = this.getAttribute("data-target");

      // 隐藏所有内容
      characterContents.forEach((content) => {
        content.classList.remove("active");
        content.style.display = "none";
      });

      // 显示对应内容
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add("active");
        targetContent.style.display = "block";
      }
    });
  });
}

// 用户管理功能
function initAuthFunctions() {
  // 确保用户数据存在
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]));
  }

  // 获取DOM元素
  const registerForm = document.getElementById("register-form-elements");
  const loginForm = document.getElementById("login-form-elements");
  const showLoginLink = document.getElementById("show-login");
  const showRegisterLink = document.getElementById("show-register");
  const authLink = document.getElementById("auth-link");
  const userInfo = document.getElementById("user-info");
  const userName = document.getElementById("user-name");
  const userAvatar = document.getElementById("user-avatar");
  const logoutLink = document.getElementById("logout-link");

  // 检查是否已登录
  checkLoginStatus();

  // 注册表单提交
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      handleRegister();
    });
  }

  // 登录表单提交
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      handleLogin();
    });
  }

  // 切换表单显示
  if (showLoginLink) {
    showLoginLink.addEventListener("click", function (e) {
      e.preventDefault();
      switchToLogin();
    });
  }

  if (showRegisterLink) {
    showRegisterLink.addEventListener("click", function (e) {
      e.preventDefault();
      switchToRegister();
    });
  }

  // 退出登录
  if (logoutLink) {
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();
      handleLogout();
    });
  }

  // 注册处理函数
  function handleRegister() {
    // 获取表单数据
    const name = document.getElementById("full-name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const source = document.getElementById("select-where").value;

    // 清除之前的错误信息
    clearErrors();

    // 表单验证
    let isValid = true;

    if (!name) {
      setError("name-error", "请输入姓名");
      isValid = false;
    }

    if (!validateEmail(email)) {
      setError("email-error", "请输入有效的邮箱地址");
      isValid = false;
    }

    if (password.length < 6) {
      setError("password-error", "密码至少需要6位字符");
      isValid = false;
    }

    if (!source) {
      alert("请选择您从哪里了解到我们");
      isValid = false;
    }

    if (!isValid) return;

    // 检查邮箱是否已注册
    const users = JSON.parse(localStorage.getItem("users"));
    const existingUser = users.find((user) => user.email === email);

    if (existingUser) {
      setError("email-error", "该邮箱已被注册");
      return;
    }

    // 创建新用户
    const newUser = {
      id: Date.now(),
      name,
      email,
      password, // 注意：实际应用中应该加密存储密码
      source,
      createdAt: new Date().toISOString(),
    };

    // 保存用户
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // 注册成功提示
    alert("注册成功！请登录您的账号。");

    // 切换到登录表单
    switchToLogin();

    // 自动填充邮箱
    document.getElementById("login-email").value = email;
  }

  // 登录处理函数
  function handleLogin() {
    // 获取表单数据
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    // 清除之前的错误信息
    clearErrors();

    // 表单验证
    let isValid = true;

    if (!validateEmail(email)) {
      setError("login-email-error", "请输入有效的邮箱地址");
      isValid = false;
    }

    if (!password) {
      setError("login-password-error", "请输入密码");
      isValid = false;
    }

    if (!isValid) return;

    // 验证用户凭据
    const users = JSON.parse(localStorage.getItem("users"));
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      setError("login-password-error", "邮箱或密码不正确");
      return;
    }

    // 登录成功
    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    // 保存登录状态
    sessionStorage.setItem("currentUser", JSON.stringify(sessionUser));

    // 更新UI
    updateLoginUI(sessionUser);

    // 跳转到首页
    window.location.href = "index.html";
  }

  // 退出登录处理
  function handleLogout() {
    sessionStorage.removeItem("currentUser");
    checkLoginStatus();
  }

  // 检查登录状态
  function checkLoginStatus() {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

    if (currentUser) {
      updateLoginUI(currentUser);
    } else {
      // 未登录状态
      if (authLink) authLink.textContent = "登录";
      if (userInfo) userInfo.classList.add("hidden");
    }
  }

  // 更新登录UI
  function updateLoginUI(user) {
    if (authLink) {
      authLink.textContent = user.name;
      authLink.removeAttribute("href");
      authLink.style.cursor = "default";
    }
    if (userName) userName.textContent = user.name;

    // 生成随机颜色头像
    if (userAvatar) {
      const colors = ["#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      userAvatar.style.backgroundColor = randomColor;
      userAvatar.textContent = user.name.charAt(0).toUpperCase();
    }

    if (userInfo) userInfo.classList.remove("hidden");
  }

  // 切换到登录表单
  function switchToLogin() {
    document.getElementById("register-form").classList.add("hidden");
    document.getElementById("login-form").classList.remove("hidden");
  }

  // 切换到注册表单
  function switchToRegister() {
    document.getElementById("login-form").classList.add("hidden");
    document.getElementById("register-form").classList.remove("hidden");
  }

  // 工具函数：邮箱验证
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // 错误提示函数
  function setError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  }

  function clearErrors() {
    const errorElements = document.querySelectorAll(".error-message");
    errorElements.forEach((element) => {
      element.textContent = "";
      element.style.display = "none";
    });
  }
}

// 初始化轮播图功能
function initCarousel() {
  // 获取DOM元素
  const modal = document.getElementById("carouselModal");
  const closeBtn = document.getElementById("closeCarousel");
  const prevBtn = document.getElementById("prevSlide");
  const nextBtn = document.getElementById("nextSlide");
  const slides = document.querySelectorAll(".carousel-slide");
  const indicatorsContainer = document.getElementById("carouselIndicators");
  const galleryItems = document.querySelectorAll(".gallery-item");

  let currentSlide = 0;

  // 初始化指示器
  function initIndicators() {
    indicatorsContainer.innerHTML = "";
    slides.forEach((_, index) => {
      const indicator = document.createElement("div");
      indicator.classList.add("carousel-indicator");
      if (index === currentSlide) indicator.classList.add("active");
      indicator.addEventListener("click", () => goToSlide(index));
      indicatorsContainer.appendChild(indicator);
    });
  }

  // 切换到指定幻灯片
  function goToSlide(n) {
    slides[currentSlide].classList.remove("active");
    currentSlide = (n + slides.length) % slides.length;
    slides[currentSlide].classList.add("active");

    // 更新指示器
    document
      .querySelectorAll(".carousel-indicator")
      .forEach((indicator, index) => {
        if (index === currentSlide) {
          indicator.classList.add("active");
        } else {
          indicator.classList.remove("active");
        }
      });
  }

  // 下一张幻灯片
  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  // 上一张幻灯片
  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  // 打开模态框并显示对应图片
  function openCarousel(index) {
    modal.classList.add("active");
    goToSlide(index);
    document.body.style.overflow = "hidden"; // 防止背景滚动
  }

  // 关闭模态框
  function closeCarousel() {
    modal.classList.remove("active");
    document.body.style.overflow = ""; // 恢复背景滚动
  }

  // 添加事件监听器
  closeBtn.addEventListener("click", closeCarousel);
  prevBtn.addEventListener("click", prevSlide);
  nextBtn.addEventListener("click", nextSlide);

  // 为每个图片添加点击事件
  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => openCarousel(index));
  });

  // 键盘导航支持
  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("active")) return;

    if (e.key === "Escape") {
      closeCarousel();
    } else if (e.key === "ArrowLeft") {
      prevSlide();
    } else if (e.key === "ArrowRight") {
      nextSlide();
    }
  });

  // 触摸滑动支持
  let touchStartX = 0;
  let touchEndX = 0;

  modal.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  modal.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    const minSwipeDistance = 50;

    if (touchEndX < touchStartX && touchStartX - touchEndX > minSwipeDistance) {
      nextSlide(); // 向左滑动
    }

    if (touchEndX > touchStartX && touchEndX - touchStartX > minSwipeDistance) {
      prevSlide(); // 向右滑动
    }
  }

  // 点击模态框背景关闭
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeCarousel();
    }
  });

  // 初始化指示器
  initIndicators();
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", function () {
  // 初始化手风琴功能
  if (document.querySelector(".accordion-header")) {
    initAccordion();
  }

  // 初始化角色选择功能
  if (document.querySelector(".character-list")) {
    initCharacterSelection();
  }

  // 初始化登录注册功能
  initAuthFunctions();

  // 初始化轮播图功能
  if (document.getElementById("carouselModal")) {
    initCarousel();
  }
});

// 修复服务器功能
// 检测浏览器并添加相应类名
document.documentElement.className +=
  " " +
  (navigator.userAgent.indexOf("Firefox") > -1 ? "firefox" : "") +
  " " +
  (navigator.userAgent.indexOf("Safari") > -1 ? "safari" : "") +
  " " +
  (navigator.userAgent.indexOf("Chrome") > -1 ? "chrome" : "") +
  " " +
  (navigator.userAgent.indexOf("MSIE") > -1 ||
  navigator.userAgent.indexOf("Trident") > -1
    ? "ie"
    : "");

// 修复Firefox的拖动问题
if (navigator.userAgent.indexOf("Firefox") > -1) {
  document.addEventListener("DOMContentLoaded", function () {
    var noDragElements = document.querySelectorAll(".no-drag");
    noDragElements.forEach(function (el) {
      el.addEventListener("dragstart", function (e) {
        e.preventDefault();
        return false;
      });
    });
  });
}
