 
// دفتر الدرجات
let subjects = JSON.parse(localStorage.getItem('studentSubjects')) || [];
let currentEditingSubject = null;
let minGradeThreshold = 70;
let gradeScale = 100;

document.addEventListener('DOMContentLoaded', function() {
    loadSubjects();
    updateGradesSummary();
    setupEventListeners();
    
    // تحميل الإعدادات
    const savedMinGrade = localStorage.getItem('minGradeThreshold');
    const savedGradeScale = localStorage.getItem('gradeScale');
    
    if (savedMinGrade) {
        minGradeThreshold = parseInt(savedMinGrade);
        document.getElementById('min-grade').value = minGradeScale;
        document.getElementById('min-grade-value').textContent = `${minGradeThreshold}%`;
    }
    
    if (savedGradeScale) {
        gradeScale = parseInt(savedGradeScale);
        document.getElementById('grade-scale').value = gradeScale;
    }
});

// تحميل المواد
function loadSubjects() {
    const subjectsList = document.getElementById('subjects-list');
    const emptySubjects = document.getElementById('empty-subjects');
    
    if (subjects.length === 0) {
        emptySubjects.classList.remove('hidden');
        subjectsList.innerHTML = '';
        subjectsList.appendChild(emptySubjects);
        updateGradesSummary();
        return;
    }
    
    emptySubjects.classList.add('hidden');
    subjectsList.innerHTML = '';
    
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
    
    // تحويل الدرجة حسب المقياس
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
                <h3 class="subject-name">${subject.name}</h3>
                ${subject.code ? `<p class="subject-code">${subject.code}</p>` : ''}
            </div>
            <div class="grade-value ${gradeClass}">${displayGrade.toFixed(1)}</div>
        </div>
        <div class="subject-grade-inputs">
            <div class="subject-grade-input">
                <label>الامتحان</label>
                <input type="text" value="${subject.exam}" readonly>
            </div>
            <div class="subject-grade-input">
                <label>الكويزات</label>
                <input type="text" value="${subject.quiz}" readonly>
            </div>
            <div class="subject-grade-input">
                <label>النشاط</label>
                <input type="text" value="${subject.activity}" readonly>
            </div>
        </div>
        <div class="progress-container">
            <div class="progress-label">
                <span>المعدل</span>
                <span>${totalGrade.toFixed(1)}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill ${progressClass}" style="width: ${totalGrade}%"></div>
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
    document.getElementById('subjects-count').textContent = subjectsCount;
    
    if (subjectsCount === 0) {
        document.getElementById('overall-grade').textContent = '0.0';
        document.getElementById('grade-percentage').textContent = '0%';
        document.getElementById('grade-progress').style.width = '0%';
        document.getElementById('best-subject-grade').textContent = '0.0';
        document.getElementById('best-subject-name').textContent = 'لا توجد مواد';
        document.getElementById('excellent-count').textContent = '0';
        document.getElementById('average-count').textContent = '0';
        
        // إخفاء تحذير المعدل المنخفض
        document.getElementById('low-grade-warning').classList.add('hidden');
        return;
    }
    
    // حساب المعدل العام والإحصائيات
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
    document.getElementById('overall-grade').textContent = displayOverallGrade.toFixed(1);
    document.getElementById('overall-grade').className = `grade-value ${gradeClass}`;
    document.getElementById('grade-percentage').textContent = `${overallGrade.toFixed(1)}%`;
    
    const progressFill = document.getElementById('grade-progress');
    progressFill.style.width = `${overallGrade}%`;
    progressFill.className = `progress-fill ${progressClass}`;
    
    document.getElementById('best-subject-grade').textContent = displayBestGrade.toFixed(1);
    document.getElementById('best-subject-name').textContent = bestSubject.name;
    
    document.getElementById('excellent-count').textContent = excellentCount;
    document.getElementById('average-count').textContent = averageCount + goodCount + poorCount;
    
    // تحديث حالة المعدل
    const gradeStatus = document.getElementById('grade-status');
    if (overallGrade >= 90) {
        gradeStatus.innerHTML = '<i class="fas fa-trophy"></i> <span>ممتاز! استمر في هذا التميز</span>';
        gradeStatus.style.backgroundColor = 'var(--success-light)';
    } else if (overallGrade >= 80) {
        gradeStatus.innerHTML = '<i class="fas fa-thumbs-up"></i> <span>جيد جداً، يمكنك التحسين أكثر</span>';
        gradeStatus.style.backgroundColor = 'var(--info-light)';
    } else if (overallGrade >= 70) {
        gradeStatus.innerHTML = '<i class="fas fa-check-circle"></i> <span>مقبول، يحتاج إلى تحسين</span>';
        gradeStatus.style.backgroundColor = 'var(--warning-light)';
    } else {
        gradeStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>ضعيف، تحتاج إلى بذل جهد أكبر</span>';
        gradeStatus.style.backgroundColor = 'var(--danger-light)';
    }
    
    // عرض تحذير المعدل المنخفض
    if (lowGradeSubjects.length > 0) {
        const warningCard = document.getElementById('low-grade-warning');
        const subjectsList = document.getElementById('low-grade-subjects');
        
        warningCard.classList.remove('hidden');
        subjectsList.innerHTML = '';
        
        lowGradeSubjects.forEach(subject => {
            const li = document.createElement('li');
            li.textContent = `${subject.name}: ${subject.grade.toFixed(1)}%`;
            subjectsList.appendChild(li);
        });
    } else {
        document.getElementById('low-grade-warning').classList.add('hidden');
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
    
    // إنشاء المخطط
    const chart = new Chart(ctx, {
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
                            family: 'Tajawal'
                        },
                        padding: 20
                    }
                }
            }
        }
    });
}

// تحديث نقاط القوة والضعف
function updateStrengthsWeaknesses() {
    const strengthsList = document.getElementById('strengths-list');
    const weaknessesList = document.getElementById('weaknesses-list');
    
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
    
    if (!name || !exam) {
        showNotification('خطأ', 'الرجاء إدخال اسم المادة ودرجة الامتحان على الأقل');
        return;
    }
    
    const subjectData = {
        id: currentEditingSubject !== null ? subjects[currentEditingSubject].id : Date.now(),
        name,
        code,
        credit: parseInt(credit) || 3,
        semester,
        exam: parseFloat(exam) || 0,
        quiz: parseFloat(quiz) || 0,
        activity: parseFloat(activity) || 0,
        createdAt: new Date().toISOString()
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
    const subject = subjects[index];
    currentEditingSubject = index;
    
    document.getElementById('subject-name').value = subject.name;
    document.getElementById('subject-code').value = subject.code || '';
    document.getElementById('subject-credit').value = subject.credit || 3;
    document.getElementById('subject-semester').value = subject.semester || 'الأول';
    document.getElementById('exam-grade').value = subject.exam;
    document.getElementById('quiz-slider').value = subject.exam;
    document.getElementById('quiz-grade').value = subject.quiz;
    document.getElementById('quiz-slider').value = subject.quiz;
    document.getElementById('activity-grade').value = subject.activity;
    document.getElementById('activity-slider').value = subject.activity;
    
    updateExpectedGrade();
    showSubjectForm();
}

// حذف مادة
function deleteSubject(index) {
    if (confirm('هل أنت متأكد من حذف هذه المادة؟')) {
        subjects.splice(index, 1);
        saveSubjects();
        loadSubjects();
        showNotification('تم الحذف', 'تم حذف المادة بنجاح');
    }
}

// حفظ المواد
function saveSubjects() {
    localStorage.setItem('studentSubjects', JSON.stringify(subjects));
}

// إظهار نموذج المادة
function showSubjectForm() {
    document.getElementById('subject-form').classList.remove('hidden');
    document.getElementById('add-subject').textContent = 'إلغاء الإضافة';
    document.getElementById('add-subject').innerHTML = '<i class="fas fa-times"></i> إلغاء الإضافة';
}

// إخفاء نموذج المادة
function hideSubjectForm() {
    document.getElementById('subject-form').classList.add('hidden');
    document.getElementById('add-subject').innerHTML = '<i class="fas fa-plus"></i> إضافة مادة';
    document.getElementById('subject-form').reset();
    currentEditingSubject = null;
    
    // إعادة تعيين السلايدر
    document.getElementById('exam-slider').value = 0;
    document.getElementById('quiz-slider').value = 0;
    document.getElementById('activity-slider').value = 0;
    document.getElementById('expected-grade').textContent = '0.0';
    document.getElementById('expected-progress').style.width = '0%';
}

// تحديث المعدل المتوقع
function updateExpectedGrade() {
    const exam = parseFloat(document.getElementById('exam-grade').value) || 0;
    const quiz = parseFloat(document.getElementById('quiz-grade').value) || 0;
    const activity = parseFloat(document.getElementById('activity-grade').value) || 0;
    
    const expectedGrade = (exam * 0.6) + (quiz * 0.2) + (activity * 0.2);
    
    document.getElementById('expected-grade').textContent = expectedGrade.toFixed(1);
    document.getElementById('expected-progress').style.width = `${expectedGrade}%`;
    
    // تحديث لون شريط التقدم المتوقع
    const progressClass = getProgressClass(expectedGrade);
    document.getElementById('expected-progress').className = `progress-fill ${progressClass}`;
}

// إظهار التنبيه
function showNotification(title, message) {
    const notification = document.getElementById('notification');
    const notificationTitle = document.getElementById('notification-title');
    const notificationMessage = document.getElementById('notification-message');
    
    if (notification && notificationTitle && notificationMessage) {
        notificationTitle.textContent = title;
        notificationMessage.textContent = message;
        
        notification.classList.remove('hidden');
        
        // إخفاء التنبيه تلقائياً بعد 5 ثواني
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 5000);
    }
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // إضافة/إلغاء مادة
    document.getElementById('add-subject').addEventListener('click', function() {
        if (document.getElementById('subject-form').classList.contains('hidden')) {
            showSubjectForm();
        } else {
            hideSubjectForm();
        }
    });
    
    // حفظ مادة
    document.getElementById('save-subject').addEventListener('click', saveSubject);
    
    // إلغاء إضافة مادة
    document.getElementById('cancel-subject').addEventListener('click', hideSubjectForm);
    
    // استخدام التفويض للأحداث للمواد
    document.getElementById('subjects-list').addEventListener('click', function(e) {
        if (e.target.closest('.edit-subject')) {
            const index = e.target.closest('.edit-subject').getAttribute('data-index');
            editSubject(index);
        }
        
        if (e.target.closest('.delete-subject')) {
            const index = e.target.closest('.delete-subject').getAttribute('data-index');
            deleteSubject(index);
        }
    });
    
    // تحديث السلايدر
    document.getElementById('exam-slider').addEventListener('input', function() {
        document.getElementById('exam-grade').value = this.value;
        updateExpectedGrade();
    });
    
    document.getElementById('quiz-slider').addEventListener('input', function() {
        document.getElementById('quiz-grade').value = this.value;
        updateExpectedGrade();
    });
    
    document.getElementById('activity-slider').addEventListener('input', function() {
        document.getElementById('activity-grade').value = this.value;
        updateExpectedGrade();
    });
    
    // تحديث حقول الإدخال
    document.getElementById('exam-grade').addEventListener('input', function() {
        document.getElementById('exam-slider').value = this.value;
        updateExpectedGrade();
    });
    
    document.getElementById('quiz-grade').addEventListener('input', function() {
        document.getElementById('quiz-slider').value = this.value;
        updateExpectedGrade();
    });
    
    document.getElementById('activity-grade').addEventListener('input', function() {
        document.getElementById('activity-slider').value = this.value;
        updateExpectedGrade();
    });
    
    // تحديث الحد الأدنى للمعدل
    document.getElementById('min-grade').addEventListener('input', function() {
        minGradeThreshold = parseInt(this.value);
        document.getElementById('min-grade-value').textContent = `${minGradeThreshold}%`;
        localStorage.setItem('minGradeThreshold', minGradeThreshold);
        updateGradesSummary();
    });
    
    // تحديث نظام الدرجات
    document.getElementById('grade-scale').addEventListener('change', function() {
        gradeScale = parseInt(this.value);
        localStorage.setItem('gradeScale', gradeScale);
        loadSubjects();
    });
    
    // تجاهل تحذير المعدل المنخفض
    document.getElementById('dismiss-warning').addEventListener('click', function() {
        document.getElementById('low-grade-warning').classList.add('hidden');
    });
    
    // أزرار الحاسبة
    document.getElementById('calc-exam').addEventListener('click', function() {
        const examGrade = prompt('أدخل درجة الامتحان النهائي:', '0');
        if (examGrade !== null) {
            document.getElementById('exam-grade').value = examGrade;
            document.getElementById('exam-slider').value = examGrade;
            updateExpectedGrade();
        }
    });
    
    document.getElementById('calc-quiz').addEventListener('click', function() {
        const quizGrade = prompt('أدخل متوسط درجة الكويزات:', '0');
        if (quizGrade !== null) {
            document.getElementById('quiz-grade').value = quizGrade;
            document.getElementById('quiz-slider').value = quizGrade;
            updateExpectedGrade();
        }
    });
    
    document.getElementById('calc-activity').addEventListener('click', function() {
        const activityGrade = prompt('أدخل درجة النشاط والواجبات:', '0');
        if (activityGrade !== null) {
            document.getElementById('activity-grade').value = activityGrade;
            document.getElementById('activity-slider').value = activityGrade;
            updateExpectedGrade();
        }
    });
}