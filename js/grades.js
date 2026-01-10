// دفتر الدرجات
let subjects = JSON.parse(localStorage.getItem('studentSubjects')) || [];
let currentEditingSubject = null;
let minGradeThreshold = 70;
let gradeScale = 100;
let gradesChart = null; // متغير لحفظ مثيل المخطط

document.addEventListener('DOMContentLoaded', function() {
    loadSubjects();
    updateGradesSummary();
    setupEventListeners();
    
    // تحميل الإعدادات المحفوظة
    const savedMinGrade = localStorage.getItem('minGradeThreshold');
    const savedGradeScale = localStorage.getItem('gradeScale');
    
    if (savedMinGrade !== null) {
        minGradeThreshold = parseInt(savedMinGrade);
        document.getElementById('min-grade').value = minGradeThreshold;
        document.getElementById('min-grade-value').textContent = `${minGradeThreshold}%`;
    }
    
    if (savedGradeScale !== null) {
        gradeScale = parseInt(savedGradeScale);
        document.getElementById('grade-scale').value = gradeScale;
    }
});

// تحميل المواد
function loadSubjects() {
    const subjectsList = document.getElementById('subjects-list');
    const emptySubjects = document.getElementById('empty-subjects');
    
    if (!subjectsList) return;
    
    if (subjects.length === 0) {
        if (emptySubjects) emptySubjects.classList.remove('hidden');
        subjectsList.innerHTML = '';
        subjectsList.appendChild(emptySubjects);
        updateGradesSummary();
        return;
    }
    
    if (emptySubjects) emptySubjects.classList.add('hidden');
    subjectsList.innerHTML = '';
    
    // ترتيب المواد حسب المعدل (الأعلى أولاً)
    subjects.sort((a, b) => {
        const gradeA = calculateSubjectGrade(a);
        const gradeB = calculateSubjectGrade(b);
        return gradeB - gradeA;
    });
    
    subjects.forEach((subject, index) => {
        const subjectCard = createSubjectCard(subject, index);
        subjectsList.appendChild(subjectCard);
    });
    
    updateGradesSummary();
}

// إنشاء بطاقة مادة
function createSubjectCard(subject, index) {
    const totalGrade = calculateSubjectGrade(subject);
    const gradeClass = getGradeClass(totalGrade);
    const progressClass = getProgressClass(totalGrade);
    
    let displayGrade = totalGrade;
    if (gradeScale === 4) {
        displayGrade = (totalGrade / 100) * 4;
    } else if (gradeScale === 5) {
        displayGrade = (totalGrade / 100) * 5;
    }
    
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.dataset.index = index;
    
    card.innerHTML = `
        <div class="subject-header">
            <div>
                <h3 class="subject-name">${subject.name || 'مادة بدون اسم'}</h3>
                ${subject.code ? `<p class="subject-code">${subject.code}</p>` : ''}
            </div>
            <div class="grade-value ${gradeClass}">${displayGrade.toFixed(1)}</div>
        </div>
        <div class="subject-grade-inputs">
            <div class="subject-grade-input">
                <label>الامتحان (60%)</label>
                <input type="text" value="${subject.exam || 0}" readonly>
            </div>
            <div class="subject-grade-input">
                <label>الكويزات (20%)</label>
                <input type="text" value="${subject.quiz || 0}" readonly>
            </div>
            <div class="subject-grade-input">
                <label>النشاط (20%)</label>
                <input type="text" value="${subject.activity || 0}" readonly>
            </div>
        </div>
        <div class="progress-container">
            <div class="progress-label">
                <span>المعدل</span>
                <span>${totalGrade.toFixed(1)}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill ${progressClass}" style="width: ${Math.min(totalGrade, 100)}%"></div>
            </div>
        </div>
        <div class="subject-footer">
            <button class="btn edit-subject" data-index="${index}">
                <i class="fas fa-edit"></i>
                تعديل
            </button>
            <button class="btn delete-btn delete-subject" data-index="${index}">
                <i class="fas fa-trash"></i>
                حذف
            </button>
        </div>
    `;
    
    return card;
}

// حساب درجة المادة
function calculateSubjectGrade(subject) {
    const exam = parseFloat(subject.exam) || 0;
    const quiz = parseFloat(subject.quiz) || 0;
    const activity = parseFloat(subject.activity) || 0;
    
    return (exam * 0.6) + (quiz * 0.2) + (activity * 0.2);
}

// تحديد فئة الدرجة
function getGradeClass(grade) {
    if (grade >= 90) return 'grade-excellent';
    if (grade >= 80) return 'grade-good';
    if (grade >= 70) return 'grade-average';
    return 'grade-poor';
}

// تحديد فئة شريط التقدم
function getProgressClass(grade) {
    if (grade >= 90) return 'progress-excellent';
    if (grade >= 80) return 'progress-good';
    if (grade >= 70) return 'progress-average';
    return 'progress-poor';
}

// تحديث ملخص الدرجات
function updateGradesSummary() {
    const subjectsCount = subjects.length;
    const subjectsCountElement = document.getElementById('subjects-count');
    if (subjectsCountElement) subjectsCountElement.textContent = subjectsCount;
    
    if (subjectsCount === 0) {
        const overallGradeElement = document.getElementById('overall-grade');
        const gradePercentageElement = document.getElementById('grade-percentage');
        const gradeProgressElement = document.getElementById('grade-progress');
        const bestSubjectGradeElement = document.getElementById('best-subject-grade');
        const bestSubjectNameElement = document.getElementById('best-subject-name');
        const excellentCountElement = document.getElementById('excellent-count');
        const averageCountElement = document.getElementById('average-count');
        const gradeStatusElement = document.getElementById('grade-status');
        const lowGradeWarning = document.getElementById('low-grade-warning');
        
        if (overallGradeElement) overallGradeElement.textContent = '0.0';
        if (gradePercentageElement) gradePercentageElement.textContent = '0%';
        if (gradeProgressElement) {
            gradeProgressElement.style.width = '0%';
            gradeProgressElement.className = 'progress-fill progress-poor';
        }
        if (bestSubjectGradeElement) bestSubjectGradeElement.textContent = '0.0';
        if (bestSubjectNameElement) bestSubjectNameElement.textContent = 'لا توجد مواد';
        if (excellentCountElement) excellentCountElement.textContent = '0';
        if (averageCountElement) averageCountElement.textContent = '0';
        if (gradeStatusElement) {
            gradeStatusElement.innerHTML = '<i class="fas fa-info-circle"></i> <span>أضف مواد لبدء الحساب</span>';
            gradeStatusElement.style.backgroundColor = '';
        }
        if (lowGradeWarning) lowGradeWarning.classList.add('hidden');
        
        // تدمير المخطط القديم إذا كان موجوداً
        if (gradesChart) {
            gradesChart.destroy();
            gradesChart = null;
        }
        
        // تحديث نقاط القوة والضعف
        updateStrengthsWeaknesses();
        return;
    }
    
    let totalGrade = 0;
    let bestSubject = { name: '', grade: 0 };
    let excellentCount = 0;
    let goodCount = 0;
    let averageCount = 0;
    let poorCount = 0;
    let lowGradeSubjects = [];
    
    subjects.forEach(subject => {
        const subjectGrade = calculateSubjectGrade(subject);
        totalGrade += subjectGrade;
        
        // تحديث أفضل مادة
        if (subjectGrade > bestSubject.grade) {
            bestSubject = { name: subject.name, grade: subjectGrade };
        }
        
        // عد المواد حسب التصنيف
        if (subjectGrade >= 90) excellentCount++;
        else if (subjectGrade >= 80) goodCount++;
        else if (subjectGrade >= 70) averageCount++;
        else poorCount++;
        
        // جمع المواد ذات المعدل المنخفض
        if (subjectGrade < minGradeThreshold) {
            lowGradeSubjects.push({
                name: subject.name,
                grade: subjectGrade
            });
        }
    });
    
    const overallGrade = totalGrade / subjectsCount;
    const gradeClass = getGradeClass(overallGrade);
    const progressClass = getProgressClass(overallGrade);
    
    // تحويل الدرجة حسب المقياس
    let displayOverallGrade = overallGrade;
    let displayBestGrade = bestSubject.grade;
    
    if (gradeScale === 4) {
        displayOverallGrade = (overallGrade / 100) * 4;
        displayBestGrade = (bestSubject.grade / 100) * 4;
    } else if (gradeScale === 5) {
        displayOverallGrade = (overallGrade / 100) * 5;
        displayBestGrade = (bestSubject.grade / 100) * 5;
    }
    
    // تحديث الواجهة
    const overallGradeElement = document.getElementById('overall-grade');
    const gradePercentageElement = document.getElementById('grade-percentage');
    const gradeProgressElement = document.getElementById('grade-progress');
    const bestSubjectGradeElement = document.getElementById('best-subject-grade');
    const bestSubjectNameElement = document.getElementById('best-subject-name');
    const excellentCountElement = document.getElementById('excellent-count');
    const averageCountElement = document.getElementById('average-count');
    const gradeStatusElement = document.getElementById('grade-status');
    
    if (overallGradeElement) {
        overallGradeElement.textContent = displayOverallGrade.toFixed(1);
        overallGradeElement.className = `grade-value ${gradeClass}`;
    }
    
    if (gradePercentageElement) {
        gradePercentageElement.textContent = `${overallGrade.toFixed(1)}%`;
    }
    
    if (gradeProgressElement) {
        gradeProgressElement.style.width = `${overallGrade}%`;
        gradeProgressElement.className = `progress-fill ${progressClass}`;
    }
    
    if (bestSubjectGradeElement) {
        bestSubjectGradeElement.textContent = displayBestGrade.toFixed(1);
    }
    
    if (bestSubjectNameElement) {
        bestSubjectNameElement.textContent = bestSubject.name;
    }
    
    if (excellentCountElement) {
        excellentCountElement.textContent = excellentCount;
    }
    
    if (averageCountElement) {
        averageCountElement.textContent = (averageCount + goodCount + poorCount);
    }
    
    // تحديث حالة المعدل
    if (gradeStatusElement) {
        if (overallGrade >= 90) {
            gradeStatusElement.innerHTML = '<i class="fas fa-trophy"></i> <span>ممتاز! استمر في هذا التميز</span>';
            gradeStatusElement.style.backgroundColor = 'var(--success-light)';
        } else if (overallGrade >= 80) {
            gradeStatusElement.innerHTML = '<i class="fas fa-thumbs-up"></i> <span>جيد جداً، يمكنك التحسين أكثر</span>';
            gradeStatusElement.style.backgroundColor = 'var(--info-light)';
        } else if (overallGrade >= 70) {
            gradeStatusElement.innerHTML = '<i class="fas fa-check-circle"></i> <span>مقبول، يحتاج إلى تحسين</span>';
            gradeStatusElement.style.backgroundColor = 'var(--warning-light)';
        } else {
            gradeStatusElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>ضعيف، تحتاج إلى بذل جهد أكبر</span>';
            gradeStatusElement.style.backgroundColor = 'var(--danger-light)';
        }
    }
    
    // عرض تحذير المعدل المنخفض
    const warningCard = document.getElementById('low-grade-warning');
    const subjectsList = document.getElementById('low-grade-subjects');
    
    if (lowGradeSubjects.length > 0 && warningCard && subjectsList) {
        warningCard.classList.remove('hidden');
        subjectsList.innerHTML = '';
        
        lowGradeSubjects.forEach(subject => {
            const li = document.createElement('li');
            li.textContent = `${subject.name}: ${subject.grade.toFixed(1)}%`;
            subjectsList.appendChild(li);
        });
    } else if (warningCard) {
        warningCard.classList.add('hidden');
    }
    
    // تحديث تحليل الأداء
    updatePerformanceAnalysis();
}

// تحديث تحليل الأداء
function updatePerformanceAnalysis() {
    // تحديث المخطط
    updateGradesChart();
    
    // تحديث نقاط القوة والضعف
    updateStrengthsWeaknesses();
}

// تحديث مخطط الدرجات
function updateGradesChart() {
    const ctx = document.getElementById('grades-chart');
    if (!ctx) return;
    
    // تدمير المخطط القديم إذا كان موجوداً
    if (gradesChart) {
        gradesChart.destroy();
        gradesChart = null;
    }
    
    if (subjects.length === 0) {
        // إذا لم تكن هناك مواد، عرض رسالة في المخطط
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }
    
    // جمع البيانات حسب التصنيف
    const labels = ['ممتاز (90-100)', 'جيد (80-89)', 'مقبول (70-79)', 'ضعيف (أقل من 70)'];
    const data = [0, 0, 0, 0];
    
    subjects.forEach(subject => {
        const grade = calculateSubjectGrade(subject);
        if (grade >= 90) data[0]++;
        else if (grade >= 80) data[1]++;
        else if (grade >= 70) data[2]++;
        else data[3]++;
    });
    
    const colors = [
        'rgba(76, 175, 80, 0.7)',
        'rgba(33, 150, 243, 0.7)',
        'rgba(255, 152, 0, 0.7)',
        'rgba(244, 67, 54, 0.7)'
    ];
    
    // إنشاء المخطط الجديد
    try {
        gradesChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderColor: colors.map(color => color.replace('0.7', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        rtl: true,
                        labels: {
                            font: {
                                family: 'Tajawal, Poppins, sans-serif'
                            },
                            padding: 20,
                            color: '#333'
                        }
                    },
                    tooltip: {
                        rtl: true,
                        titleFont: {
                            family: 'Tajawal'
                        },
                        bodyFont: {
                            family: 'Tajawal'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('خطأ في إنشاء المخطط:', error);
    }
}

// تحديث نقاط القوة والضعف
function updateStrengthsWeaknesses() {
    const strengthsList = document.getElementById('strengths-list');
    const weaknessesList = document.getElementById('weaknesses-list');
    
    if (!strengthsList || !weaknessesList) return;
    
    strengthsList.innerHTML = '';
    weaknessesList.innerHTML = '';
    
    if (subjects.length === 0) {
        strengthsList.innerHTML = '<li>لا توجد بيانات كافية</li>';
        weaknessesList.innerHTML = '<li>لا توجد بيانات كافية</li>';
        return;
    }
    
    // فرز المواد حسب الدرجة
    const sortedSubjects = [...subjects].sort((a, b) => {
        return calculateSubjectGrade(b) - calculateSubjectGrade(a);
    });
    
    // أفضل 3 مواد (نقاط القوة)
    const topSubjects = sortedSubjects.slice(0, Math.min(3, sortedSubjects.length));
    topSubjects.forEach(subject => {
        const grade = calculateSubjectGrade(subject);
        const li = document.createElement('li');
        li.textContent = `${subject.name}: ${grade.toFixed(1)}%`;
        strengthsList.appendChild(li);
    });
    
    // أسوأ 3 مواد (نقاط الضعف)
    const bottomSubjects = sortedSubjects.slice(-Math.min(3, sortedSubjects.length)).reverse();
    bottomSubjects.forEach(subject => {
        const grade = calculateSubjectGrade(subject);
        const li = document.createElement('li');
        li.textContent = `${subject.name}: ${grade.toFixed(1)}%`;
        weaknessesList.appendChild(li);
    });
    
    if (strengthsList.children.length === 0) {
        strengthsList.innerHTML = '<li>لا توجد مواد ممتازة</li>';
    }
    
    if (weaknessesList.children.length === 0) {
        weaknessesList.innerHTML = '<li>لا توجد مواد ضعيفة</li>';
    }
}

// حفظ مادة
function saveSubject() {
    const name = document.getElementById('subject-name').value.trim();
    const code = document.getElementById('subject-code').value.trim();
    const credit = document.getElementById('subject-credit').value;
    const semester = document.getElementById('subject-semester').value;
    const exam = document.getElementById('exam-grade').value;
    const quiz = document.getElementById('quiz-grade').value;
    const activity = document.getElementById('activity-grade').value;
    
    if (!name) {
        showNotification('خطأ', 'الرجاء إدخال اسم المادة');
        return;
    }
    
    const subjectData = {
        id: currentEditingSubject !== null ? subjects[currentEditingSubject].id : Date.now(),
        name,
        code: code || '',
        credit: parseInt(credit) || 3,
        semester: semester || 'الأول',
        exam: parseFloat(exam) || 0,
        quiz: parseFloat(quiz) || 0,
        activity: parseFloat(activity) || 0,
        createdAt: currentEditingSubject !== null ? subjects[currentEditingSubject].createdAt : new Date().toISOString()
    };
    
    if (currentEditingSubject !== null) {
        subjects[currentEditingSubject] = subjectData;
    } else {
        subjects.push(subjectData);
    }
    
    saveSubjects();
    loadSubjects();
    hideSubjectForm();
    
    showNotification('تم بنجاح', `تم ${currentEditingSubject !== null ? 'تعديل' : 'إضافة'} المادة بنجاح`);
    currentEditingSubject = null;
}

// تعديل مادة
function editSubject(index) {
    if (index < 0 || index >= subjects.length) return;
    
    const subject = subjects[index];
    currentEditingSubject = index;
    
    document.getElementById('subject-name').value = subject.name || '';
    document.getElementById('subject-code').value = subject.code || '';
    document.getElementById('subject-credit').value = subject.credit || 3;
    document.getElementById('subject-semester').value = subject.semester || 'الأول';
    document.getElementById('exam-grade').value = subject.exam || 0;
    document.getElementById('exam-slider').value = subject.exam || 0;
    document.getElementById('quiz-grade').value = subject.quiz || 0;
    document.getElementById('quiz-slider').value = subject.quiz || 0;
    document.getElementById('activity-grade').value = subject.activity || 0;
    document.getElementById('activity-slider').value = subject.activity || 0;
    
    updateExpectedGrade();
    showSubjectForm();
}

// حذف مادة
function deleteSubject(index) {
    if (index < 0 || index >= subjects.length) return;
    
    if (confirm('هل أنت متأكد من حذف هذه المادة؟')) {
        subjects.splice(index, 1);
        saveSubjects();
        loadSubjects();
        showNotification('تم الحذف', 'تم حذف المادة بنجاح');
        
        // إذا كنا نعدل المادة المحذوفة، نغلق النموذج
        if (currentEditingSubject === index) {
            hideSubjectForm();
            currentEditingSubject = null;
        }
    }
}

// حفظ المواد
function saveSubjects() {
    try {
        localStorage.setItem('studentSubjects', JSON.stringify(subjects));
    } catch (error) {
        console.error('خطأ في حفظ المواد:', error);
        showNotification('خطأ', 'تعذر حفظ البيانات');
    }
}

// إظهار نموذج المادة
function showSubjectForm() {
    const subjectForm = document.getElementById('subject-form');
    const addSubjectBtn = document.getElementById('add-subject');
    
    if (subjectForm) subjectForm.classList.remove('hidden');
    if (addSubjectBtn) {
        addSubjectBtn.innerHTML = '<i class="fas fa-times"></i> إلغاء الإضافة';
    }
}

// إخفاء نموذج المادة
function hideSubjectForm() {
    const subjectForm = document.getElementById('subject-form');
    const addSubjectBtn = document.getElementById('add-subject');
    
    if (subjectForm) {
        subjectForm.classList.add('hidden');
        subjectForm.reset();
    }
    
    if (addSubjectBtn) {
        addSubjectBtn.innerHTML = '<i class="fas fa-plus"></i> إضافة مادة';
    }
    
    // إعادة تعيين القيم
    document.getElementById('exam-slider').value = 0;
    document.getElementById('quiz-slider').value = 0;
    document.getElementById('activity-slider').value = 0;
    document.getElementById('expected-grade').textContent = '0.0';
    
    const expectedProgress = document.getElementById('expected-progress');
    if (expectedProgress) {
        expectedProgress.style.width = '0%';
        expectedProgress.className = 'progress-fill progress-poor';
    }
    
    currentEditingSubject = null;
}

// تحديث المعدل المتوقع
function updateExpectedGrade() {
    const exam = parseFloat(document.getElementById('exam-grade').value) || 0;
    const quiz = parseFloat(document.getElementById('quiz-grade').value) || 0;
    const activity = parseFloat(document.getElementById('activity-grade').value) || 0;
    
    const expectedGrade = (exam * 0.6) + (quiz * 0.2) + (activity * 0.2);
    
    document.getElementById('expected-grade').textContent = expectedGrade.toFixed(1);
    
    const expectedProgress = document.getElementById('expected-progress');
    if (expectedProgress) {
        expectedProgress.style.width = `${expectedGrade}%`;
        
        // تحديث لون شريط التقدم المتوقع
        const progressClass = getProgressClass(expectedGrade);
        expectedProgress.className = `progress-fill ${progressClass}`;
    }
}

// إظهار التنبيه
function showNotification(title, message) {
    // إنشاء عنصر التنبيه إذا لم يكن موجوداً
    let notification = document.getElementById('notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification hidden';
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-exclamation"></i>
            </div>
            <div class="notification-content">
                <h4 id="notification-title"></h4>
                <p id="notification-message"></p>
            </div>
            <button class="close-notification" id="close-notification">
                <i class="fas fa-times"></i>
            </button>
        `;
        document.body.appendChild(notification);
        
        // إضافة مستمع حدث لإغلاق التنبيه
        document.getElementById('close-notification').addEventListener('click', function() {
            notification.classList.add('hidden');
        });
    }
    
    document.getElementById('notification-title').textContent = title;
    document.getElementById('notification-message').textContent = message;
    
    notification.classList.remove('hidden');
    
    // إخفاء التنبيه تلقائياً بعد 5 ثواني
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000);
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // إضافة/إلغاء مادة
    const addSubjectBtn = document.getElementById('add-subject');
    if (addSubjectBtn) {
        addSubjectBtn.addEventListener('click', function() {
            const subjectForm = document.getElementById('subject-form');
            if (subjectForm && subjectForm.classList.contains('hidden')) {
                showSubjectForm();
            } else {
                hideSubjectForm();
            }
        });
    }
    
    // حفظ مادة
    const saveSubjectBtn = document.getElementById('save-subject');
    if (saveSubjectBtn) {
        saveSubjectBtn.addEventListener('click', saveSubject);
    }
    
    // إلغاء إضافة مادة
    const cancelSubjectBtn = document.getElementById('cancel-subject');
    if (cancelSubjectBtn) {
        cancelSubjectBtn.addEventListener('click', hideSubjectForm);
    }
    
    // استخدام التفويض للأحداث للمواد
    const subjectsList = document.getElementById('subjects-list');
    if (subjectsList) {
        subjectsList.addEventListener('click', function(e) {
            if (e.target.closest('.edit-subject')) {
                const btn = e.target.closest('.edit-subject');
                const index = parseInt(btn.getAttribute('data-index'));
                if (!isNaN(index)) {
                    editSubject(index);
                }
            }
            
            if (e.target.closest('.delete-subject')) {
                const btn = e.target.closest('.delete-subject');
                const index = parseInt(btn.getAttribute('data-index'));
                if (!isNaN(index)) {
                    deleteSubject(index);
                }
            }
        });
    }
    
    // تحديث السلايدر مع حقول الإدخال
    const examSlider = document.getElementById('exam-slider');
    const quizSlider = document.getElementById('quiz-slider');
    const activitySlider = document.getElementById('activity-slider');
    
    const examGrade = document.getElementById('exam-grade');
    const quizGrade = document.getElementById('quiz-grade');
    const activityGrade = document.getElementById('activity-grade');
    
    if (examSlider && examGrade) {
        examSlider.addEventListener('input', function() {
            examGrade.value = this.value;
            updateExpectedGrade();
        });
        
        examGrade.addEventListener('input', function() {
            examSlider.value = this.value;
            updateExpectedGrade();
        });
    }
    
    if (quizSlider && quizGrade) {
        quizSlider.addEventListener('input', function() {
            quizGrade.value = this.value;
            updateExpectedGrade();
        });
        
        quizGrade.addEventListener('input', function() {
            quizSlider.value = this.value;
            updateExpectedGrade();
        });
    }
    
    if (activitySlider && activityGrade) {
        activitySlider.addEventListener('input', function() {
            activityGrade.value = this.value;
            updateExpectedGrade();
        });
        
        activityGrade.addEventListener('input', function() {
            activitySlider.value = this.value;
            updateExpectedGrade();
        });
    }
    
    // تحديث الحد الأدنى للمعدل
    const minGradeInput = document.getElementById('min-grade');
    if (minGradeInput) {
        minGradeInput.addEventListener('input', function() {
            minGradeThreshold = parseInt(this.value);
            const minGradeValue = document.getElementById('min-grade-value');
            if (minGradeValue) {
                minGradeValue.textContent = `${minGradeThreshold}%`;
            }
            localStorage.setItem('minGradeThreshold', minGradeThreshold);
            updateGradesSummary();
        });
    }
    
    // تحديث نظام الدرجات
    const gradeScaleSelect = document.getElementById('grade-scale');
    if (gradeScaleSelect) {
        gradeScaleSelect.addEventListener('change', function() {
            gradeScale = parseInt(this.value);
            localStorage.setItem('gradeScale', gradeScale);
            loadSubjects();
        });
    }
    
    // تجاهل تحذير المعدل المنخفض
    const dismissWarningBtn = document.getElementById('dismiss-warning');
    if (dismissWarningBtn) {
        dismissWarningBtn.addEventListener('click', function() {
            const warningCard = document.getElementById('low-grade-warning');
            if (warningCard) {
                warningCard.classList.add('hidden');
            }
        });
    }
    
    // أزرار الحاسبة
    const calcExamBtn = document.getElementById('calc-exam');
    const calcQuizBtn = document.getElementById('calc-quiz');
    const calcActivityBtn = document.getElementById('calc-activity');
    
    if (calcExamBtn && examGrade) {
        calcExamBtn.addEventListener('click', function() {
            const examGradeValue = prompt('أدخل درجة الامتحان النهائي:', examGrade.value || '0');
            if (examGradeValue !== null) {
                examGrade.value = examGradeValue;
                if (examSlider) examSlider.value = examGradeValue;
                updateExpectedGrade();
            }
        });
    }
    
    if (calcQuizBtn && quizGrade) {
        calcQuizBtn.addEventListener('click', function() {
            const quizGradeValue = prompt('أدخل متوسط درجة الكويزات:', quizGrade.value || '0');
            if (quizGradeValue !== null) {
                quizGrade.value = quizGradeValue;
                if (quizSlider) quizSlider.value = quizGradeValue;
                updateExpectedGrade();
            }
        });
    }
    
    if (calcActivityBtn && activityGrade) {
        calcActivityBtn.addEventListener('click', function() {
            const activityGradeValue = prompt('أدخل درجة النشاط والواجبات:', activityGrade.value || '0');
            if (activityGradeValue !== null) {
                activityGrade.value = activityGradeValue;
                if (activitySlider) activitySlider.value = activityGradeValue;
                updateExpectedGrade();
            }
        });
    }
    
    // تحديث السلايدرات عند تحميل الصفحة
    updateExpectedGrade();
    // تحديث المخطط عند تحميل الصفحة
    updateGradesChart();
    // تحديث نقاط القوة والضعف عند تحميل الصفحة
    updateStrengthsWeaknesses();
    // نهاية مستمعي الأحداث
    // نهاية مستمعي الأحداث
    if (gradesChart) {
        gradesChart.resize();
    }
}