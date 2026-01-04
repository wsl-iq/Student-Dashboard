// الملاحظات السريعة
let notes = JSON.parse(localStorage.getItem('studentNotes')) || [];
let currentEditingNote = null;
let currentCategory = '';
let isImportant = false;

document.addEventListener('DOMContentLoaded', function() {
    loadNotes();
    setupEventListeners();
    setupTextFormatting();
    
    // تعيين المحتوى القابل للتحرير
    document.getElementById('note-content').focus();
    
    // تعيين التاريخ الافتراضي للتنبيهات
    checkForNotifications();
});

// تحميل الملاحظات
function loadNotes() {
    const notesList = document.getElementById('notes-list-sidebar');
    const emptyNotes = document.querySelector('.empty-state-sidebar');
    
    if (notes.length === 0) {
        if (emptyNotes) emptyNotes.style.display = 'block';
        if (notesList) notesList.innerHTML = '<div class="empty-state-sidebar"><i class="fas fa-sticky-note"></i><p>لا توجد ملاحظات</p></div>';
        return;
    }
    
    if (emptyNotes) emptyNotes.style.display = 'none';
    if (!notesList) return;
    
    notesList.innerHTML = '';
    
    // ترتيب الملاحظات من الأحدث إلى الأقدم
    notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    notes.forEach((note, index) => {
        const noteItem = createNoteListItem(note, index);
        notesList.appendChild(noteItem);
    });
    
    // تحميل أول ملاحظة إذا كانت موجودة
    if (notes.length > 0) {
        viewNote(0);
    } else {
        showEmptyState();
    }
    
    setupNoteSearch();
    setupNoteFilters();
}

// إنشاء عنصر قائمة الملاحظات
function createNoteListItem(note, index) {
    const item = document.createElement('div');
    item.className = 'note-item-sidebar';
    item.dataset.index = index;
    item.dataset.category = note.category || '';
    item.dataset.important = note.important || false;
    
    // تقليل المحتوى المعروض
    const previewContent = note.content.length > 100 
        ? note.content.substring(0, 100) + '...' 
        : note.content;
    
    // إزالة علامات HTML مع الحفاظ على فواصل الأسطر
    const cleanContent = previewContent
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    
    item.innerHTML = `
        <h4>${note.title || 'بدون عنوان'}</h4>
        <p>${cleanContent}</p>
        <div class="note-item-meta">
            <span>${formatDate(note.createdAt, true)}</span>
            ${note.category ? `<span class="note-category">${note.category}</span>` : ''}
            ${note.important ? '<span class="note-important"><i class="fas fa-star"></i></span>' : ''}
        </div>
    `;
    
    return item;
}

// عرض ملاحظة
function viewNote(index) {
    if (index < 0 || index >= notes.length) return;
    
    const note = notes[index];
    currentEditingNote = index;
    
    // إخفاء المحرر وعرض المشاهد
    document.getElementById('notes-editor').classList.add('hidden');
    document.getElementById('note-viewer').classList.remove('hidden');
    document.getElementById('notes-empty').classList.add('hidden');
    
    // تحديث محتوى المشاهد
    document.getElementById('viewer-title').textContent = note.title || 'بدون عنوان';
    document.getElementById('viewer-date').textContent = formatDate(note.updatedAt || note.createdAt, true);
    
    // عرض المحتوى مع تحسين الأمان
    let safeContent = note.content;
    // تنظيف المحتوى من السكريبت الضار
    safeContent = safeContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    document.getElementById('viewer-content').innerHTML = safeContent;
    
    // تحديث الفئة والأهمية
    const categoryEl = document.getElementById('viewer-category');
    const importantEl = document.getElementById('viewer-important');
    
    if (note.category) {
        categoryEl.textContent = note.category;
        categoryEl.style.display = 'inline-block';
    } else {
        categoryEl.style.display = 'none';
    }
    
    if (note.important) {
        importantEl.innerHTML = '<i class="fas fa-star"></i>';
        importantEl.style.display = 'inline-block';
    } else {
        importantEl.style.display = 'none';
    }
    
    // تحديث العنصر النشط في القائمة
    document.querySelectorAll('.note-item-sidebar').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeItem = document.querySelector(`.note-item-sidebar[data-index="${index}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

// تحرير ملاحظة
function editNote() {
    if (currentEditingNote === null) return;
    
    const note = notes[currentEditingNote];
    
    // تعبئة النموذج
    document.getElementById('note-title').value = note.title || '';
    document.getElementById('note-content').innerHTML = note.content;
    currentCategory = note.category || '';
    isImportant = note.important || false;
    
    // تحديث أزرار التحرير
    updateEditorButtons();
    
    // إخفاء المشاهد وإظهار المحرر
    document.getElementById('note-viewer').classList.add('hidden');
    document.getElementById('notes-editor').classList.remove('hidden');
    document.getElementById('notes-empty').classList.add('hidden');
    
    // التركيز على المحتوى
    document.getElementById('note-content').focus();
}

// إنشاء ملاحظة جديدة
function createNewNote() {
    currentEditingNote = null;
    currentCategory = '';
    isImportant = false;
    
    // إعادة تعيين النموذج
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').innerHTML = '';
    
    // تحديث أزرار التحرير
    updateEditorButtons();
    
    // إخفاء المشاهد وإظهار المحرر
    document.getElementById('note-viewer').classList.add('hidden');
    document.getElementById('notes-empty').classList.add('hidden');
    document.getElementById('notes-editor').classList.remove('hidden');
    
    // التركيز على العنوان
    document.getElementById('note-title').focus();
}

// حفظ ملاحظة
function saveNote() {
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').innerHTML.trim();
    
    if (!title && !content) {
        showNotification('خطأ', 'الرجاء إدخال عنوان أو محتوى للملاحظة');
        return;
    }
    
    const noteData = {
        id: currentEditingNote !== null ? notes[currentEditingNote].id : Date.now(),
        title: title || 'بدون عنوان',
        content: content || '<p></p>',
        category: currentCategory,
        important: isImportant,
        createdAt: currentEditingNote !== null ? notes[currentEditingNote].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (currentEditingNote !== null) {
        notes[currentEditingNote] = noteData;
    } else {
        notes.push(noteData);
    }
    
    saveNotes();
    loadNotes();
    
    // عرض الملاحظة المحفوظة
    const noteIndex = currentEditingNote !== null ? currentEditingNote : notes.length - 1;
    viewNote(noteIndex);
    
    showNotification('تم بنجاح', `تم ${currentEditingNote !== null ? 'تعديل' : 'حفظ'} الملاحظة بنجاح`);
}

// حذف ملاحظة
function deleteNote() {
    if (currentEditingNote === null) return;
    
    if (confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
        notes.splice(currentEditingNote, 1);
        saveNotes();
        loadNotes();
        
        // عرض حالة فارغة أو الملاحظة التالية
        if (notes.length > 0) {
            viewNote(Math.min(currentEditingNote, notes.length - 1));
        } else {
            showEmptyState();
        }
        
        showNotification('تم الحذف', 'تم حذف الملاحظة بنجاح');
        currentEditingNote = null;
    }
}

// حفظ الملاحظات
function saveNotes() {
    localStorage.setItem('studentNotes', JSON.stringify(notes));
}

// تحديث أزرار المحرر
function updateEditorButtons() {
    const importantBtn = document.getElementById('toggle-important');
    
    if (isImportant) {
        importantBtn.innerHTML = '<i class="fas fa-star"></i>';
        importantBtn.style.color = '#f6d365';
    } else {
        importantBtn.innerHTML = '<i class="far fa-star"></i>';
        importantBtn.style.color = '';
    }
    
    // تحديث القائمة المنسدلة للفئة
    const categoryOptions = document.querySelectorAll('.category-option');
    categoryOptions.forEach(option => {
        option.classList.remove('active');
        if (option.dataset.category === currentCategory) {
            option.classList.add('active');
        }
    });
}

// إعداد البحث في الملاحظات
function setupNoteSearch() {
    const searchInput = document.getElementById('search-notes');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        const noteItems = document.querySelectorAll('.note-item-sidebar');
        
        noteItems.forEach(item => {
            const title = item.querySelector('h4').textContent.toLowerCase();
            const content = item.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || content.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

// إعداد فلاتر الملاحظات
function setupNoteFilters() {
    const filterButtons = document.querySelectorAll('.notes-filters .filter-btn');
    const noteItems = document.querySelectorAll('.note-item-sidebar');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            noteItems.forEach(item => {
                const index = parseInt(item.dataset.index);
                if (index < 0 || index >= notes.length) return;
                
                const note = notes[index];
                const category = note.category || '';
                const important = note.important || false;
                const createdAt = new Date(note.createdAt);
                const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                
                let shouldShow = false;
                
                if (filter === 'all') {
                    shouldShow = true;
                } else if (filter === 'recent') {
                    shouldShow = createdAt > oneWeekAgo;
                } else if (filter === 'important') {
                    shouldShow = important;
                } else if (filter === 'lecture') {
                    shouldShow = category === 'lecture';
                }
                
                item.style.display = shouldShow ? 'block' : 'none';
            });
        });
    });
}

function setupTextFormatting() {
    const toolButtons = document.querySelectorAll('.tool-btn');
    const noteContent = document.getElementById('note-content');
    
    toolButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const format = this.getAttribute('data-format');
            
            if (format === 'bold') {
                document.execCommand('bold', false, null);
            } else if (format === 'italic') {
                document.execCommand('italic', false, null);
            } else if (format === 'underline') {
                document.execCommand('underline', false, null);
            } else if (format === 'list') {
                document.execCommand('insertUnorderedList', false, null);
            } else if (format === 'list-ol') {
                document.execCommand('insertOrderedList', false, null);
            } else if (format === 'quote') {
                document.execCommand('formatBlock', false, 'blockquote');
            } else if (format === 'fontSize') {
                const dropdown = document.querySelector('.font-size-dropdown');
                dropdown.classList.toggle('hidden');
                return;
            }
            
            noteContent.focus();
        });
    });
    
    document.querySelectorAll('.font-size-dropdown button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const size = this.getAttribute('data-size');
            
            if (size === '12') {
                document.execCommand('fontSize', false, '1');
            } else if (size === '16') {
                document.execCommand('fontSize', false, '3');
            } else if (size === '20') {
                document.execCommand('fontSize', false, '5');
            }
            
            document.querySelector('.font-size-dropdown').classList.add('hidden');
            noteContent.focus();
        });
    });
    
    document.getElementById('text-color').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('color-picker').click();
    });
    
    document.getElementById('color-picker').addEventListener('input', function(e) {
        document.execCommand('foreColor', false, this.value);
        noteContent.focus();
    });
    
    document.getElementById('insert-link').addEventListener('click', function(e) {
        e.preventDefault();
        const linkDropdown = document.getElementById('link-dropdown');
        linkDropdown.classList.toggle('hidden');
    });
    
    document.getElementById('apply-link').addEventListener('click', function(e) {
        e.preventDefault();
        const url = document.getElementById('link-url').value.trim();
        const text = document.getElementById('link-text').value.trim();
        
        if (url) {
            const linkText = text || url;
            const linkHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
            document.execCommand('insertHTML', false, linkHTML);
        }
        
        document.getElementById('link-dropdown').classList.add('hidden');
        document.getElementById('link-url').value = '';
        document.getElementById('link-text').value = '';
        noteContent.focus();
    });
    
    document.getElementById('cancel-link').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('link-dropdown').classList.add('hidden');
        document.getElementById('link-url').value = '';
        document.getElementById('link-text').value = '';
    });
    
    document.getElementById('insert-image').addEventListener('click', function(e) {
        e.preventDefault();
        const imageDropdown = document.getElementById('image-dropdown');
        imageDropdown.classList.toggle('hidden');
    });
    
    document.getElementById('image-file').addEventListener('change', function(e) {
        const file = this.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('image-preview');
                const wrapper = document.getElementById('image-preview-wrapper');
                preview.src = e.target.result;
                wrapper.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.getElementById('apply-image').addEventListener('click', function(e) {
        e.preventDefault();
        const url = document.getElementById('image-url').value.trim();
        const fileInput = document.getElementById('image-file');
        
        if (url) {
            const imgHTML = `<img src="${url}" alt="صورة" style="max-width: 100%; height: auto; border-radius: 4px; margin: 10px 0;">`;
            document.execCommand('insertHTML', false, imgHTML);
        } else if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imgHTML = `<img src="${e.target.result}" alt="صورة" style="max-width: 100%; height: auto; border-radius: 4px; margin: 10px 0;">`;
                    document.execCommand('insertHTML', false, imgHTML);
                };
                reader.readAsDataURL(file);
            }
        }
        
        document.getElementById('image-dropdown').classList.add('hidden');
        document.getElementById('image-url').value = '';
        document.getElementById('image-file').value = '';
        document.getElementById('image-preview-wrapper').classList.add('hidden');
        document.getElementById('image-preview').src = '';
        noteContent.focus();
    });
    
    document.getElementById('cancel-image').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('image-dropdown').classList.add('hidden');
        document.getElementById('image-url').value = '';
        document.getElementById('image-file').value = '';
        document.getElementById('image-preview-wrapper').classList.add('hidden');
        document.getElementById('image-preview').src = '';
    });
    
    noteContent.addEventListener('input', updateCharCount);
    updateCharCount();
}

function updateCharCount() {
    const content = document.getElementById('note-content');
    const text = content.textContent || '';
    const charCount = text.length;
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    
    document.getElementById('char-count').textContent = `${charCount} حرف`;
    document.getElementById('word-count').textContent = `${wordCount} كلمة`;
}

function showEmptyState() {
    document.getElementById('notes-editor').classList.add('hidden');
    document.getElementById('note-viewer').classList.add('hidden');
    document.getElementById('notes-empty').classList.remove('hidden');
}

function formatDate(dateString, includeTime = false) {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
        return 'تاريخ غير معروف';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    if (includeTime) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
    
    return `${day}/${month}/${year}`;
}

function showNotification(title, message) {
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
        
        document.getElementById('close-notification').addEventListener('click', function() {
            notification.classList.add('hidden');
        });
    }
    
    document.getElementById('notification-title').textContent = title;
    document.getElementById('notification-message').textContent = message;
    
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000);
}

function checkForNotifications() {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentImportantNotes = notes.filter(note => {
        const noteDate = new Date(note.updatedAt || note.createdAt);
        return note.important && noteDate > oneWeekAgo;
    });
    
    if (recentImportantNotes.length > 0) {
        setTimeout(() => {
            showNotification('ملاحظات مهمة', `لديك ${recentImportantNotes.length} ملاحظة مهمة حديثة`);
        }, 1000);
    }
}

function setupEventListeners() {
    document.getElementById('new-note').addEventListener('click', createNewNote);
    document.getElementById('create-first-note').addEventListener('click', createNewNote);
    document.getElementById('save-note').addEventListener('click', saveNote);    
    document.getElementById('cancel-note').addEventListener('click', function() {
        if (currentEditingNote !== null) {
            viewNote(currentEditingNote);
        } else {
            showEmptyState();
        }
    });
    
    document.getElementById('edit-note').addEventListener('click', editNote);    
    document.getElementById('delete-note').addEventListener('click', deleteNote);    
    document.getElementById('toggle-important').addEventListener('click', function() {
        isImportant = !isImportant;
        updateEditorButtons();
    });
    
    document.getElementById('set-category').addEventListener('click', function(e) {
        e.preventDefault();
        const dropdown = document.getElementById('category-dropdown');
        dropdown.classList.toggle('hidden');
    });
    
    document.querySelectorAll('.category-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            currentCategory = this.dataset.category;
            updateEditorButtons();
            document.getElementById('category-dropdown').classList.add('hidden');
        });
    });
    
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#set-category') && !e.target.closest('#category-dropdown')) {
            document.getElementById('category-dropdown').classList.add('hidden');
        }
        
        // إغلاق قائمة أحجام الخط
        if (!e.target.closest('.tool-btn[data-format="fontSize"]') && !e.target.closest('.font-size-dropdown')) {
            document.querySelector('.font-size-dropdown').classList.add('hidden');
        }
        
        if (!e.target.closest('#insert-link') && !e.target.closest('#link-dropdown')) {
            document.getElementById('link-dropdown').classList.add('hidden');
        }
        
        if (!e.target.closest('#insert-image') && !e.target.closest('#image-dropdown')) {
            document.getElementById('image-dropdown').classList.add('hidden');
        }
    });
    
    document.getElementById('notes-list-sidebar').addEventListener('click', function(e) {
        const noteItem = e.target.closest('.note-item-sidebar');
        if (noteItem) {
            const index = parseInt(noteItem.dataset.index);
            viewNote(index);
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveNote();
        }
    });
    
    document.getElementById('note-title').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('note-content').focus();
        }
    });
    
    updateCharCount();
}