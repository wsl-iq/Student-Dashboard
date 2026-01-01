// تهيئة التطبيق - الصفحة الرئيسية
document.addEventListener('DOMContentLoaded', function() {
    // تحديث الإحصائيات السريعة
    updateQuickStats();
    
    // تحميل النصائح العشوائية
    loadRandomTips();
    
    // إعداد مستمعي الأحداث
    setupEventListeners();
});

// تحديث الإحصائيات السريعة
function updateQuickStats() {
    const tasks = JSON.parse(localStorage.getItem('studentTasks')) || [];
    const subjects = JSON.parse(localStorage.getItem('studentSubjects')) || [];
    const notes = JSON.parse(localStorage.getItem('studentNotes')) || [];
    
    const pendingTasks = tasks.filter(task => {
        const deadline = new Date(task.date + 'T' + task.time);
        return deadline > new Date();
    }).length;
    
    const totalSubjects = subjects.length;
    
    // حساب المعدل العام
    let overallGrade = 0;
    if (subjects.length > 0) {
        let totalGrade = 0;
        subjects.forEach(subject => {
            const exam = parseFloat(subject.exam) || 0;
            const quiz = parseFloat(subject.quiz) || 0;
            const activity = parseFloat(subject.activity) || 0;
            totalGrade += (exam * 0.6) + (quiz * 0.2) + (activity * 0.2);
        });
        overallGrade = totalGrade / subjects.length;
    }
    
    const statsGrid = document.getElementById('quick-stats');
    
    if (statsGrid) {
        statsGrid.innerHTML = `
            <div class="stat-card">
                <i class="fas fa-tasks"></i>
                <h4>الواجبات المعلقة</h4>
                <p>${pendingTasks} واجب</p>
            </div>
            <div class="stat-card">
                <i class="fas fa-book"></i>
                <h4>المواد الدراسية</h4>
                <p>${totalSubjects} مادة</p>
            </div>
            <div class="stat-card">
                <i class="fas fa-chart-line"></i>
                <h4>المعدل العام</h4>
                <p>${overallGrade.toFixed(1)}%</p>
            </div>
            <div class="stat-card">
                <i class="fas fa-sticky-note"></i>
                <h4>الملاحظات المحفوظة</h4>
                <p>${notes.length} ملاحظة</p>
            </div>
        `;
    }
}

// تحميل النصائح العشوائية
function loadRandomTips() {
    const tips = [
        {
            icon: 'fas fa-clock',
            text: 'خطط لجدول دراسة منتظم وخصص وقتاً محدداً لكل مادة.'
        },
        {
            icon: 'fas fa-brain',
            text: 'خذ فترات راحة قصيرة بين جلسات الدراسة لتحسين التركيز.'
        },
        {
            icon: 'fas fa-book',
            text: 'راجع الدروس أولاً بأول ولا تترك التراكم حتى وقت الامتحان.'
        },
        {
            icon: 'fas fa-check-circle',
            text: 'ضع أهدافاً واقعية وقابلة للقياس لكل جلسة دراسة.'
        },
        {
            icon: 'fas fa-users',
            text: 'شارك في مجموعات الدراسة لمناقشة الأفكار الصعبة.'
        },
        {
            icon: 'fas fa-heart',
            text: 'اعتن بصحتك الجسدية والعقلية لتحقيق أفضل أداء دراسي.'
        },
        {
            icon: 'fas fa-lightbulb',
            text: 'استخدم تقنيات التعلم النشط مثل الخرائط الذهنية والملخصات.'
        },
        {
            icon: 'fas fa-graduation-cap',
            text: 'راجع الامتحانات السابقة لفهم نمط الأسئلة والتوقيت.'
        }
    ];
    
    // اختيار 4 نصائح عشوائية
    const selectedTips = [];
    const usedIndices = new Set();
    
    while (selectedTips.length < 4 && selectedTips.length < tips.length) {
        const randomIndex = Math.floor(Math.random() * tips.length);
        if (!usedIndices.has(randomIndex)) {
            selectedTips.push(tips[randomIndex]);
            usedIndices.add(randomIndex);
        }
    }
    
    const tipsSlider = document.querySelector('.tips-slider');
    if (tipsSlider) {
        tipsSlider.innerHTML = '';
        
        selectedTips.forEach(tip => {
            const tipCard = document.createElement('div');
            tipCard.className = 'tip-card';
            tipCard.innerHTML = `
                <i class="${tip.icon}"></i>
                <p>${tip.text}</p>
            `;
            tipsSlider.appendChild(tipCard);
        });
    }
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // إضافة تأثيرات للبطاقات
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // تحديث الإحصائيات كل 30 ثانية
    setInterval(updateQuickStats, 30000);
    
    // تحديث النصائح كل دقيقة
    setInterval(loadRandomTips, 60000);
}