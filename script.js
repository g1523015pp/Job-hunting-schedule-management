document.addEventListener('DOMContentLoaded', () => {
    // --- 要素の取得 ---
    const navButtons = document.querySelectorAll('.nav-button');
    const appViews = document.querySelectorAll('.app-view');

    // カレンダービュー
    const calendarView = document.getElementById('calendar-view');
    const calendarElement = document.getElementById('calendar');
    const currentPeriodElement = document.getElementById('currentPeriod');
    const prevPeriodBtn = document.getElementById('prevPeriod');
    const nextPeriodBtn = document.getElementById('nextPeriod');
    const monthViewBtn = document.getElementById('monthViewBtn');
    const weekViewBtn = document.getElementById('weekViewBtn');
    const todayButton = document.getElementById('todayButton');
    const addEditEventForm = document.getElementById('addEditEventForm');
    const eventIdInput = document.getElementById('eventId');
    const saveEventButton = document.getElementById('saveEventButton');
    const cancelEventEditButton = document.getElementById('cancelEventEditButton');
    const requiresPreRegistrationCheckbox = document.getElementById('requiresPreRegistration');
    const preRegistrationDeadlineGroup = document.getElementById('preRegistrationDeadlineGroup');
    const eventStatusSelect = document.getElementById('eventStatus');
    const resultDueDateGroup = document.getElementById('resultDueDateGroup');
    const resultDueDateInput = document.getElementById('resultDueDate');
    const eventListElement = document.getElementById('eventList');
    const remindersList = document.getElementById('reminders');
    const deleteEventButton = document.getElementById('deleteEventButton'); // Added for event deletion

    // 日記ビュー
    const diaryView = document.getElementById('diary-view');
    const diaryDateInput = document.getElementById('diaryDate');
    const diaryContentInput = document.getElementById('diaryContent');
    const saveDiaryBtn = document.getElementById('saveDiaryBtn');
    const clearDiaryBtn = document.getElementById('clearDiaryBtn');
    const diaryListElement = document.getElementById('diaryList'); // 新規追加：日記一覧コンテナ

    // 企業一覧ビュー
    const companiesView = document.getElementById('companies-view');
    const addCompanyBtn = document.getElementById('addCompanyBtn');
    const companyListElement = document.getElementById('companyList');
    const companyForm = document.getElementById('companyForm');
    const cancelCompanyFormBtn = document.getElementById('cancelCompanyForm');
    const saveCompanyFormBtn = companyForm.querySelector('button[type="submit"]');
    const deleteCompanyBtn = document.getElementById('deleteCompanyBtn');
    const companyFormTitle = document.getElementById('companyFormTitle');

    const companyDisplayName = document.getElementById('companyDisplayName');
    const companyDisplayRating = document.getElementById('companyDisplayRating');
    const companyDisplayRemarks = document.getElementById('companyDisplayRemarks');
    const companyDisplayLocation = document.getElementById('companyDisplayLocation'); // 再有効化
    const companyDisplayURL = document.getElementById('companyDisplayURL');
    const companyDetailDisplay = document.getElementById('company-display-area');
    const closeCompanyDetailBtn = document.getElementById('closeCompanyDetailBtn');
    const editCompanyDetailBtn = document.getElementById('editCompanyBtn');
    const companyRecruitmentEventsList = document.getElementById('companyRecruitmentEventsList'); // Added for recruitment event list

    const companyRecruitmentCalendar = document.getElementById('companyRecruitmentCalendar');
    const companyCurrentPeriodElement = document.getElementById('companyCurrentPeriod');
    const companyPrevMonthBtn = document.getElementById('companyPrevMonth');
    const companyNextMonthBtn = document.getElementById('companyNextMonth');

    const showAllLocationsMapBtn = document.getElementById('showAllLocationsMapBtn');

    // 結果待ちビュー
    const pendingResultsListElement = document.getElementById('pendingResultsList');

    // --- グローバル変数 ---
    let events = JSON.parse(localStorage.getItem('events')) || [];
    let diaries = JSON.parse(localStorage.getItem('diaries')) || {};
    let companies = JSON.parse(localStorage.getItem('companies')) || [];
    let currentCalendarDate = new Date();
    let selectedCalendarDate = new Date();
    let isMonthView = true; // true: 月表示, false: 週表示

    let currentCompanyId = null; // 現在詳細表示している企業のID
    let currentCompanyCalendarDate = new Date(); // 企業別カレンダーの現在表示月

    // --- ヘルパー関数 ---
    function saveEvents() {
        localStorage.setItem('events', JSON.stringify(events));
        updateReminders();
    }

    function saveDiaries() {
        localStorage.setItem('diaries', JSON.stringify(diaries));
    }

    function saveCompanies() {
        localStorage.setItem('companies', JSON.stringify(companies));
    }

    function generateId() {
        return Math.random().toString(36).substring(2, 9);
    }

    function showView(viewId) {
        appViews.forEach(view => {
            if (view.id === viewId) {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        });
        navButtons.forEach(button => {
            if (button.dataset.view === viewId.replace('-view', '')) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        // 各ビューに切り替わったときの初期化
        if (viewId === 'calendar-view') {
            renderCalendar();
            renderEventList(selectedCalendarDate);
            updateReminders();
            hideAddEditEventForm();
        } else if (viewId === 'diary-view') {
            const today = new Date();
            diaryDateInput.value = today.toISOString().split('T')[0];
            loadDiary(diaryDateInput.value);
            renderDiaryList(); // 日記ビュー切り替え時に一覧をレンダリング
        } else if (viewId === 'companies-view') {
            renderCompanyList();
            hideCompanyForm();
            hideCompanyDetail();
        } else if (viewId === 'results-view') {
            renderPendingResults();
        }
    }

    // --- カレンダー関連の関数 ---
    function renderCalendar() {
        if (isMonthView) {
            renderMonthCalendarView();
        } else {
            renderWeekCalendarView();
        }
    }

    function renderMonthCalendarView() {
        calendarElement.innerHTML = '';
        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();
        currentPeriodElement.textContent = `${year}年 ${month + 1}月`;

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const startDay = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.

        // Day headers
        ['日', '月', '火', '水', '木', '金', '土'].forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.classList.add('day-header');
            dayHeader.textContent = day;
            calendarElement.appendChild(dayHeader);
        });

        // Empty cells for the start of the month
        for (let i = 0; i < startDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day', 'inactive');
            calendarElement.appendChild(emptyCell);
        }

        // Date cells
        for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
            const currentDay = new Date(year, month, day);
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            dayCell.dataset.date = currentDay.toISOString().split('T')[0];

            if (currentDay.toDateString() === new Date().toDateString()) {
                dayCell.classList.add('today');
            }

            const dateNumber = document.createElement('span');
            dateNumber.classList.add('date-number');
            dateNumber.textContent = day;
            dayCell.appendChild(dateNumber);

            const dayEvents = events.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate.getFullYear() === year &&
                       eventDate.getMonth() === month &&
                       eventDate.getDate() === day;
            });

            dayEvents.forEach(event => {
                const eventIndicator = document.createElement('div');
                eventIndicator.classList.add('event-indicator');
                eventIndicator.textContent = event.eventName;
                dayCell.appendChild(eventIndicator);
            });

            dayCell.addEventListener('click', () => {
                selectedCalendarDate = currentDay;
                renderEventList(selectedCalendarDate);
                showAddEditEventForm(selectedCalendarDate.toISOString().split('T')[0]);
            });
            calendarElement.appendChild(dayCell);
        }
    }

    function renderWeekCalendarView() {
        calendarElement.innerHTML = '';
        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();
        let day = currentCalendarDate.getDate();

        // Calculate the first day of the week (Sunday)
        const startOfWeek = new Date(year, month, day - currentCalendarDate.getDay());
        currentPeriodElement.textContent = `${startOfWeek.getFullYear()}年 ${startOfWeek.getMonth() + 1}月 ${startOfWeek.getDate()}日 - ${new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6).getMonth() + 1}月 ${new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6).getDate()}日`;

        // Day headers
        ['日', '月', '火', '水', '木', '金', '土'].forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.classList.add('day-header');
            dayHeader.textContent = day;
            calendarElement.appendChild(dayHeader);
        });

        // Date cells for the week
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i);
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            dayCell.dataset.date = currentDay.toISOString().split('T')[0];

            if (currentDay.toDateString() === new Date().toDateString()) {
                dayCell.classList.add('today');
            }

            const dateNumber = document.createElement('span');
            dateNumber.classList.add('date-number');
            dateNumber.textContent = currentDay.getDate();
            dayCell.appendChild(dateNumber);

            const dayEvents = events.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate.getFullYear() === currentDay.getFullYear() &&
                       eventDate.getMonth() === currentDay.getMonth() &&
                       eventDate.getDate() === currentDay.getDate();
            });

            dayEvents.forEach(event => {
                const eventIndicator = document.createElement('div');
                eventIndicator.classList.add('event-indicator');
                eventIndicator.textContent = event.eventName;
                dayCell.appendChild(eventIndicator);
            });

            dayCell.addEventListener('click', () => {
                selectedCalendarDate = currentDay;
                renderEventList(selectedCalendarDate);
                showAddEditEventForm(selectedCalendarDate.toISOString().split('T')[0]);
            });
            calendarElement.appendChild(dayCell);
        }
    }

    function renderEventList(date) {
        eventListElement.innerHTML = `<h3>${date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })} のイベント</h3><ul></ul>`;
        const ul = eventListElement.querySelector('ul');
        const dayEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === date.toDateString();
        }).sort((a, b) => {
            // 時間がある場合は時間でソート、ない場合は日付のみでソート
            if (a.eventTime && b.eventTime) {
                return a.eventTime.localeCompare(b.eventTime);
            }
            return 0;
        });

        if (dayEvents.length === 0) {
            ul.innerHTML = '<li>イベントはありません。</li>';
            return;
        }

        dayEvents.forEach(event => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="event-info">
                    <p><strong>${event.eventName}</strong> (${event.companyName || 'N/A'})</p>
                    <p>${event.eventTime ? event.eventTime + ' - ' : ''}${event.eventLocation || '場所未定'}</p>
                    <p>${event.eventDescription || '説明なし'}</p>
                    ${event.requiresPreRegistration ? `<p><strong>事前登録:</strong> 必要 (締切: ${event.preRegistrationDeadline || '未設定'})</p>` : ''}
                    <p><strong>選考状況:</strong> ${event.status}</p>
                    ${event.status === '選考中' && event.resultDueDate ? `<p><strong>結果発表予定日:</strong> ${event.resultDueDate}</p>` : ''}
                </div>
                <div class="event-actions">
                    <button class="edit-event-btn" data-id="${event.id}">編集</button>
                    <button class="delete-event-btn" data-id="${event.id}">削除</button>
                </div>
            `;
            ul.appendChild(li);
        });

        document.querySelectorAll('.edit-event-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const eventId = e.target.dataset.id;
                showAddEditEventForm(selectedCalendarDate.toISOString().split('T')[0], eventId);
            });
        });

        document.querySelectorAll('.delete-event-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const eventId = e.target.dataset.id;
                if (confirm('このイベントを削除しますか？')) {
                    events = events.filter(event => event.id !== eventId);
                    saveEvents();
                    renderCalendar();
                    renderEventList(selectedCalendarDate);
                }
            });
        });
    }

    function showAddEditEventForm(date, eventId = null) {
        addEditEventForm.style.display = 'block';
        addEditEventForm.scrollIntoView({ behavior: 'smooth' });
        eventIdInput.value = '';
        eventName.value = '';
        eventCompanyName.value = '';
        eventDate.value = date;
        eventTime.value = '';
        eventLocation.value = '';
        eventDescription.value = '';
        requiresPreRegistrationCheckbox.checked = false;
        preRegistrationDeadlineGroup.style.display = 'none';
        preRegistrationDeadline.value = '';
        eventStatusSelect.value = '予定';
        resultDueDateGroup.style.display = 'none';
        resultDueDateInput.value = '';
        deleteEventButton.style.display = 'none';

        if (eventId) {
            const event = events.find(e => e.id === eventId);
            if (event) {
                eventIdInput.value = event.id;
                eventName.value = event.eventName;
                eventCompanyName.value = event.companyName || '';
                eventDate.value = event.date;
                eventTime.value = event.eventTime || '';
                eventLocation.value = event.eventLocation || '';
                eventDescription.value = event.eventDescription || '';
                requiresPreRegistrationCheckbox.checked = event.requiresPreRegistration || false;
                if (requiresPreRegistrationCheckbox.checked) {
                    preRegistrationDeadlineGroup.style.display = 'block';
                    preRegistrationDeadline.value = event.preRegistrationDeadline || '';
                }
                eventStatusSelect.value = event.status || '予定';
                if (event.status === '選考中') {
                    resultDueDateGroup.style.display = 'block';
                    resultDueDateInput.value = event.resultDueDate || '';
                }
                deleteEventButton.style.display = 'inline-block';
            }
        }
    }

    function hideAddEditEventForm() {
        addEditEventForm.style.display = 'none';
    }

    function updateReminders() {
        remindersList.innerHTML = '';
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const upcomingEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && event.status === '予定';
        }).sort((a, b) => new Date(a.date) - new Date(b.date));

        const upcomingDeadlines = events.filter(event => {
            if (event.requiresPreRegistration && event.preRegistrationDeadline) {
                const deadlineDate = new Date(event.preRegistrationDeadline);
                return deadlineDate >= today && event.status === '予定';
            }
            return false;
        }).sort((a, b) => new Date(a.preRegistrationDeadline) - new Date(b.preRegistrationDeadline));

        if (upcomingEvents.length === 0 && upcomingDeadlines.length === 0) {
            remindersList.innerHTML = '<li>今後のリマインダーはありません。</li>';
            return;
        }

        if (upcomingEvents.length > 0) {
            const h4 = document.createElement('h4');
            h4.textContent = '今後のイベント';
            remindersList.appendChild(h4);
            upcomingEvents.forEach(event => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${event.eventName}</strong> (${event.companyName || 'N/A'}) - ${event.date} ${event.eventTime || ''} (${event.eventLocation || '場所未定'})`;
                remindersList.appendChild(li);
            });
        }

        if (upcomingDeadlines.length > 0) {
            const h4 = document.createElement('h4');
            h4.textContent = '事前登録締切';
            remindersList.appendChild(h4);
            upcomingDeadlines.forEach(event => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${event.eventName}</strong> (${event.companyName || 'N/A'}) - 締切: ${event.preRegistrationDeadline}`;
                remindersList.appendChild(li);
            });
        }
    }

    // --- 日記関連の関数 ---
    function loadDiary(date) {
        diaryContentInput.value = diaries[date] || '';
    }

    // 日記一覧をレンダリングする関数
    function renderDiaryList() {
        const diaryListUl = document.querySelector('#diaryList ul');
        diaryListUl.innerHTML = ''; // 既存のリストをクリア

        // 日記を日付の新しい順にソート
        const sortedDates = Object.keys(diaries).sort((a, b) => new Date(b) - new Date(a));

        if (sortedDates.length === 0) {
            diaryListUl.innerHTML = '<li>日記エントリはありません。</li>';
            return;
        }

        sortedDates.forEach(date => {
            const li = document.createElement('li');
            li.classList.add('diary-list-item');
            li.dataset.date = date;
            const contentSnippet = diaries[date].substring(0, 100) + (diaries[date].length > 100 ? '...' : ''); // 100文字で切り詰め
            li.innerHTML = `
                <div class="diary-item-header">
                    <span class="diary-item-date">${date}</span>
                    <div class="diary-item-actions">
                        <button class="load-diary-btn" data-date="${date}">表示/編集</button>
                        <button class="delete-diary-btn" data-date="${date}">削除</button>
                    </div>
                </div>
                <p class="diary-item-snippet">${contentSnippet}</p>
            `;
            diaryListUl.appendChild(li);
        });

        // 「表示/編集」ボタンのイベントリスナー
        document.querySelectorAll('.load-diary-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const dateToLoad = e.target.dataset.date;
                diaryDateInput.value = dateToLoad; // 日付入力欄に日付をセット
                loadDiary(dateToLoad); // 日記内容をテキストエリアに読み込む
                diaryContentInput.focus(); // テキストエリアにフォーカス
                diaryContentInput.scrollIntoView({ behavior: 'smooth', block: 'start' }); // テキストエリアまでスクロール
            });
        });

        // 「削除」ボタンのイベントリスナー
        document.querySelectorAll('.delete-diary-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const dateToDelete = e.target.dataset.date;
                if (confirm(`${dateToDelete} の日記を削除しますか？`)) {
                    delete diaries[dateToDelete];
                    saveDiaries();
                    renderDiaryList(); // リストを再レンダリング
                    // もし現在表示中の日記を削除したらテキストエリアをクリア
                    if (diaryDateInput.value === dateToDelete) {
                        diaryContentInput.value = '';
                    }
                }
            });
        });
    }

    // --- 企業一覧関連の関数 ---
    function renderCompanyList() {
        companyListElement.innerHTML = '';
        if (companies.length === 0) {
            companyListElement.innerHTML = '<p>登録されている企業はありません。</p>';
            return;
        }

        companies.forEach(company => {
            const companyItem = document.createElement('div');
            companyItem.classList.add('company-item');
            companyItem.dataset.id = company.id;

            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                starsHtml += `<i class="${i <= company.rating ? 'fas' : 'far'} fa-star"></i>`;
            }

            companyItem.innerHTML = `
                <h4>${company.name}</h4>
                <p>${company.location || '所在地不明'}</p>
                <div class="star-rating">${starsHtml}</div>
                <div class="company-actions">
                    <button class="details-btn" data-id="${company.id}">詳細</button>
                    <button class="edit-btn" data-id="${company.id}">編集</button>
                </div>
            `;
            companyListElement.appendChild(companyItem);
        });

        // クリックで詳細表示
        document.querySelectorAll('.company-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // 詳細ボタンや編集ボタンのクリックは別途処理
                if (e.target.classList.contains('details-btn') || e.target.classList.contains('edit-btn')) {
                    return;
                }
                document.querySelectorAll('.company-item').forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');
                showCompanyDetail(item.dataset.id);
            });
        });

        document.querySelectorAll('.company-item .details-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // 親要素へのイベント伝播を防ぐ
                const companyId = e.target.dataset.id;
                document.querySelectorAll('.company-item').forEach(el => el.classList.remove('selected'));
                e.target.closest('.company-item').classList.add('selected');
                showCompanyDetail(companyId);
            });
        });

        document.querySelectorAll('.company-item .edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // 親要素へのイベント伝播を防ぐ
                const companyId = e.target.dataset.id;
                showCompanyForm(companyId);
            });
        });
    }

    function showCompanyForm(companyId = null) {
        companyForm.style.display = 'block';
        companyDetailDisplay.style.display = 'none';
        companyForm.scrollIntoView({ behavior: 'smooth' });

        // フォームのリセット
        document.getElementById('companyId').value = '';
        document.getElementById('companyName').value = '';
        document.getElementById('companyFormRating').querySelectorAll('.fas').forEach(star => star.classList.replace('fas', 'far'));
        document.getElementById('recruitmentEventsContainer').innerHTML = '<button type="button" id="addRecruitmentEventBtn" class="small-add-button">募集イベントを追加</button>';
        document.getElementById('companyFormLocation').value = '';
        document.getElementById('companyFormURL').value = '';
        document.getElementById('companyFormRemarks').value = '';
        deleteCompanyBtn.style.display = 'none'; // 新規追加時は削除ボタン非表示

        // 編集モード
        if (companyId) {
            const company = companies.find(c => c.id === companyId);
            if (company) {
                document.getElementById('companyFormTitle').textContent = '企業を編集';
                document.getElementById('companyId').value = company.id;
                document.getElementById('companyName').value = company.name;
                // 評価の星をセット
                document.getElementById('companyFormRating').querySelectorAll('.fa-star').forEach(star => {
                    if (parseInt(star.dataset.value) <= company.rating) {
                        star.classList.replace('far', 'fas');
                    }
                });
                // 募集イベントをロード
                company.recruitmentEvents.forEach(event => addRecruitmentEventField(event));
                document.getElementById('companyFormLocation').value = company.location || '';
                document.getElementById('companyFormURL').value = company.url || '';
                document.getElementById('companyFormRemarks').value = company.remarks || '';
                deleteCompanyBtn.style.display = 'inline-block'; // 編集時は削除ボタン表示
            }
        } else {
            document.getElementById('companyFormTitle').textContent = '新しい企業';
            deleteCompanyBtn.style.display = 'none';
        }
        // 募集イベント追加ボタンのイベントリスナーを再設定
        document.getElementById('addRecruitmentEventBtn').onclick = () => addRecruitmentEventField();
    }

    function hideCompanyForm() {
        companyForm.style.display = 'none';
        renderCompanyList(); // 企業リストを最新の状態に更新
    }

    function showCompanyDetail(companyId) {
        const company = companies.find(c => c.id === companyId);
        if (!company) return;

        companyDetailDisplay.style.display = 'block';
        companyForm.style.display = 'none'; // フォームを隠す
        companyDetailDisplay.scrollIntoView({ behavior: 'smooth' });

        companyDisplayName.textContent = company.name;
        companyDisplayRating.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('i');
            star.classList.add(i <= company.rating ? 'fas' : 'far', 'fa-star');
            companyDisplayRating.appendChild(star);
        }
        companyDisplayLocation.textContent = company.location || 'N/A'; // オフィス所在地を表示
        if (company.url) {
            companyDisplayURL.textContent = company.url;
            companyDisplayURL.href = company.url;
        } else {
            companyDisplayURL.textContent = 'N/A';
            companyDisplayURL.href = '#';
        }
        companyDisplayRemarks.textContent = company.remarks || 'N/A';

        currentCompanyId = companyId; // 現在表示中の企業IDをセット
        currentCompanyCalendarDate = new Date(); // カレンダーの表示月をリセット
        renderCompanyRecruitmentEventsList(companyId); // 募集イベントリストをレンダリング
        renderCompanyRecruitmentCalendar(companyId, currentCompanyCalendarDate);
    }

    function hideCompanyDetail() {
        companyDetailDisplay.style.display = 'none';
        document.querySelectorAll('.company-item').forEach(el => el.classList.remove('selected'));
        currentCompanyId = null; // 企業IDをクリア
    }

    function addRecruitmentEventField(event = {}) {
        const container = document.getElementById('recruitmentEventsContainer');
        const newEventDiv = document.createElement('div');
        newEventDiv.classList.add('recruitment-event-item');
        newEventDiv.innerHTML = `
            <input type="text" class="recruitment-event-name" placeholder="イベント名" value="${event.name || ''}">
            <input type="date" class="recruitment-event-date" value="${event.date || ''}">
            <select class="recruitment-event-type">
                <option value="説明会" ${event.type === '説明会' ? 'selected' : ''}>説明会</option>
                <option value="面接" ${event.type === '面接' ? 'selected' : ''}>面接</option>
                <option value="インターン" ${event.type === 'インターン' ? 'selected' : ''}>インターン</option>
                <option value="その他" ${event.type === 'その他' ? 'selected' : ''}>その他</option>
            </select>
            <button type="button" class="remove-recruitment-event-btn">削除</button>
        `;
        // "募集イベントを追加" ボタンの直前に新しいイベントフィールドを追加
        const addBtn = document.getElementById('addRecruitmentEventBtn');
        container.insertBefore(newEventDiv, addBtn);

        newEventDiv.querySelector('.remove-recruitment-event-btn').addEventListener('click', (e) => {
            e.target.closest('.recruitment-event-item').remove();
        });
    }

    function renderCompanyRecruitmentEventsList(companyId) {
        companyRecruitmentEventsList.innerHTML = '';
        const company = companies.find(c => c.id === companyId);
        if (!company || !company.recruitmentEvents || company.recruitmentEvents.length === 0) {
            companyRecruitmentEventsList.innerHTML = '<p>募集イベントは登録されていません。</p>';
            return;
        }

        company.recruitmentEvents.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.classList.add('recruitment-event-display-item');
            eventItem.innerHTML = `
                <span class="name">${event.name}</span>
                <span class="type">(${event.type})</span>
                <span class="date">${event.date}</span>
            `;
            companyRecruitmentEventsList.appendChild(eventItem);
        });
    }


    function renderCompanyRecruitmentCalendar(companyId, date) {
        companyRecruitmentCalendar.innerHTML = '';
        const company = companies.find(c => c.id === companyId);
        if (!company) return;

        const year = date.getFullYear();
        const month = date.getMonth();
        companyCurrentPeriodElement.textContent = `${year}年 ${month + 1}月`;

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const startDay = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.

        // Day headers
        ['日', '月', '火', '水', '木', '金', '土'].forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.classList.add('day-header');
            dayHeader.textContent = day;
            companyRecruitmentCalendar.appendChild(dayHeader);
        });

        // Empty cells for the start of the month
        for (let i = 0; i < startDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day', 'inactive');
            companyRecruitmentCalendar.appendChild(emptyCell);
        }

        // Date cells
        for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
            const currentDay = new Date(year, month, day);
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            dayCell.dataset.date = currentDay.toISOString().split('T')[0];

            if (currentDay.toDateString() === new Date().toDateString()) {
                dayCell.classList.add('today');
            }

            const dateNumber = document.createElement('span');
            dateNumber.classList.add('date-number');
            dateNumber.textContent = day;
            dayCell.appendChild(dateNumber);

            const dayEvents = company.recruitmentEvents.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate.getFullYear() === year &&
                       eventDate.getMonth() === month &&
                       eventDate.getDate() === day;
            });

            dayEvents.forEach(event => {
                const eventIndicator = document.createElement('div');
                eventIndicator.classList.add('event-indicator');
                eventIndicator.textContent = event.name;
                dayCell.appendChild(eventIndicator);
            });
            companyRecruitmentCalendar.appendChild(dayCell);
        }
    }


    // --- 結果待ち関連の関数 ---
    function renderPendingResults() {
        pendingResultsListElement.innerHTML = '';
        const pendingEvents = events.filter(event =>
            event.status === '選考中' && event.resultDueDate && new Date(event.resultDueDate) >= new Date()
        ).sort((a, b) => new Date(a.resultDueDate) - new Date(b.resultDueDate));

        if (pendingEvents.length === 0) {
            pendingResultsListElement.innerHTML = '<p>現在、結果待ちのイベントはありません。</p>';
            return;
        }

        const ul = document.createElement('ul');
        pendingEvents.forEach(event => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${event.eventName}</strong> (${event.companyName || 'N/A'}) - 結果発表予定日: ${event.resultDueDate}`;
            ul.appendChild(li);
        });
        pendingResultsListElement.appendChild(ul);
    }

    // --- イベントリスナー ---

    // ナビゲーションボタン
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            showView(button.dataset.view + '-view');
        });
    });

    // カレンダー操作
    prevPeriodBtn.addEventListener('click', () => {
        if (isMonthView) {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        } else {
            currentCalendarDate.setDate(currentCalendarDate.getDate() - 7);
        }
        renderCalendar();
    });

    nextPeriodBtn.addEventListener('click', () => {
        if (isMonthView) {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        } else {
            currentCalendarDate.setDate(currentCalendarDate.getDate() + 7);
        }
        renderCalendar();
    });

    monthViewBtn.addEventListener('click', () => {
        isMonthView = true;
        monthViewBtn.classList.add('active');
        weekViewBtn.classList.remove('active');
        renderCalendar();
    });

    weekViewBtn.addEventListener('click', () => {
        isMonthView = false;
        weekViewBtn.classList.add('active');
        monthViewBtn.classList.remove('active');
        renderCalendar();
    });

    todayButton.addEventListener('click', () => {
        currentCalendarDate = new Date();
        selectedCalendarDate = new Date();
        renderCalendar();
        renderEventList(selectedCalendarDate);
    });

    // イベントフォーム表示制御
    requiresPreRegistrationCheckbox.addEventListener('change', () => {
        preRegistrationDeadlineGroup.style.display = requiresPreRegistrationCheckbox.checked ? 'block' : 'none';
    });

    eventStatusSelect.addEventListener('change', () => {
        resultDueDateGroup.style.display = eventStatusSelect.value === '選考中' ? 'block' : 'none';
    });

    // イベント保存
    saveEventButton.addEventListener('click', (e) => {
        e.preventDefault();
        const eventId = eventIdInput.value;
        const eventNameVal = eventName.value;
        const eventCompanyNameVal = eventCompanyName.value;
        const eventDateVal = eventDate.value;
        const eventTimeVal = eventTime.value;
        const eventLocationVal = eventLocation.value;
        const eventDescriptionVal = eventDescription.value;
        const requiresPreRegistrationVal = requiresPreRegistrationCheckbox.checked;
        const preRegistrationDeadlineVal = requiresPreRegistrationVal ? preRegistrationDeadline.value : '';
        const eventStatusVal = eventStatusSelect.value;
        const resultDueDateVal = eventStatusVal === '選考中' ? resultDueDateInput.value : '';

        if (!eventNameVal || !eventDateVal) {
            alert('イベント名と日付は必須です。');
            return;
        }

        if (eventId) {
            // 既存イベントを更新
            events = events.map(event =>
                event.id === eventId
                    ? { ...event, eventName: eventNameVal, companyName: eventCompanyNameVal, date: eventDateVal, eventTime: eventTimeVal, eventLocation: eventLocationVal, eventDescription: eventDescriptionVal, requiresPreRegistration: requiresPreRegistrationVal, preRegistrationDeadline: preRegistrationDeadlineVal, status: eventStatusVal, resultDueDate: resultDueDateVal }
                    : event
            );
        } else {
            // 新しいイベントを追加
            const newEvent = {
                id: generateId(),
                eventName: eventNameVal,
                companyName: eventCompanyNameVal,
                date: eventDateVal,
                eventTime: eventTimeVal,
                eventLocation: eventLocationVal,
                eventDescription: eventDescriptionVal,
                requiresPreRegistration: requiresPreRegistrationVal,
                preRegistrationDeadline: preRegistrationDeadlineVal,
                status: eventStatusVal,
                resultDueDate: resultDueDateVal
            };
            events.push(newEvent);
        }
        saveEvents();
        renderCalendar();
        renderEventList(selectedCalendarDate);
        hideAddEditEventForm();
    });

    cancelEventEditButton.addEventListener('click', hideAddEditEventForm);

    deleteEventButton.addEventListener('click', () => {
        const eventId = eventIdInput.value;
        if (confirm('このイベントを削除しますか？')) {
            events = events.filter(event => event.id !== eventId);
            saveEvents();
            renderCalendar();
            renderEventList(selectedCalendarDate);
            hideAddEditEventForm();
        }
    });


    // 日記保存
    saveDiaryBtn.addEventListener('click', () => {
        const date = diaryDateInput.value;
        const content = diaryContentInput.value;
        if (date) {
            diaries[date] = content;
            saveDiaries();
            alert('日記を保存しました！');
            renderDiaryList(); // 日記保存後、一覧を更新
        }
    });

    // 日記クリア
    clearDiaryBtn.addEventListener('click', () => {
        const date = diaryDateInput.value;
        if (date && diaries[date]) { // 選択されている日付の日記のみクリア対象
            if (confirm(`${date} の日記をクリアしますか？`)) {
                diaryContentInput.value = '';
                delete diaries[date];
                saveDiaries();
                alert('日記をクリアしました。');
                renderDiaryList(); // 日記クリア後、一覧を更新
            }
        } else {
            // 日付が選択されていないか、その日の日記がない場合はテキストエリアのみクリア
            diaryContentInput.value = '';
        }
    });

    // 日付変更で日記ロード
    diaryDateInput.addEventListener('change', (e) => {
        loadDiary(e.target.value);
    });

    // 企業関連イベントリスナー
    addCompanyBtn.addEventListener('click', () => {
        showCompanyForm();
    });

    cancelCompanyFormBtn.addEventListener('click', hideCompanyForm);

    // 評価の星クリック
    document.getElementById('companyFormRating').addEventListener('click', (e) => {
        if (e.target.classList.contains('fa-star')) {
            const value = parseInt(e.target.dataset.value);
            document.getElementById('companyFormRating').querySelectorAll('.fa-star').forEach(star => {
                if (parseInt(star.dataset.value) <= value) {
                    star.classList.replace('far', 'fas');
                } else {
                    star.classList.replace('fas', 'far');
                }
            });
        }
    });

    // 企業フォーム保存
    companyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const companyId = document.getElementById('companyId').value;
        const companyName = document.getElementById('companyName').value;
        const companyRating = document.getElementById('companyFormRating').querySelectorAll('.fas').length;
        const companyLocation = document.getElementById('companyFormLocation').value;
        const companyURL = document.getElementById('companyFormURL').value;
        const companyRemarks = document.getElementById('companyFormRemarks').value;

        // 募集イベントの情報を取得
        const recruitmentEvents = [];
        document.querySelectorAll('.recruitment-event-item').forEach(item => {
            const name = item.querySelector('.recruitment-event-name').value;
            const date = item.querySelector('.recruitment-event-date').value;
            const type = item.querySelector('.recruitment-event-type').value;
            if (name && date) { // イベント名と日付が入力されていれば追加
                recruitmentEvents.push({ name, date, type });
            }
        });


        if (!companyName) {
            alert('企業名は必須です。');
            return;
        }

        if (companyId) {
            // 既存企業を更新
            companies = companies.map(company =>
                company.id === companyId
                    ? { ...company, name: companyName, rating: companyRating, location: companyLocation, url: companyURL, remarks: companyRemarks, recruitmentEvents: recruitmentEvents }
                    : company
            );
        } else {
            // 新しい企業を追加
            const newCompany = {
                id: generateId(),
                name: companyName,
                rating: companyRating,
                location: companyLocation,
                url: companyURL,
                remarks: companyRemarks,
                recruitmentEvents: recruitmentEvents // 募集イベントを追加
            };
            companies.push(newCompany);
        }
        saveCompanies();
        hideCompanyForm();
        renderCompanyList();
    });

    closeCompanyDetailBtn.addEventListener('click', hideCompanyDetail);

    editCompanyDetailBtn.addEventListener('click', () => {
        if (currentCompanyId) {
            showCompanyForm(currentCompanyId);
        }
    });

    deleteCompanyBtn.addEventListener('click', () => {
        const companyId = document.getElementById('companyId').value;
        if (confirm('この企業を完全に削除しますか？関連する全てのイベントも削除されます。')) {
            companies = companies.filter(company => company.id !== companyId);
            // 企業に関連するイベントも削除 (会社名でフィルタリングする)
            events = events.filter(event => {
                const company = companies.find(c => c.id === companyId);
                return event.companyName !== (company ? company.name : null);
            });
            saveCompanies();
            saveEvents(); // イベントも更新
            hideCompanyForm();
            hideCompanyDetail(); // 詳細表示も閉じる
            renderCompanyList();
            renderCalendar(); // カレンダーも更新
        }
    });


    // 企業カレンダーのナビゲーション
    companyPrevMonthBtn.addEventListener('click', () => {
        if (currentCompanyId) {
            currentCompanyCalendarDate.setMonth(currentCompanyCalendarDate.getMonth() - 1);
            renderCompanyRecruitmentCalendar(currentCompanyId, currentCompanyCalendarDate);
        } else {
            console.error('No company selected for calendar navigation.');
        }
    });

    companyNextMonthBtn.addEventListener('click', () => {
        if (currentCompanyId) {
            currentCompanyCalendarDate.setMonth(currentCompanyCalendarDate.getMonth() + 1);
            renderCompanyRecruitmentCalendar(currentCompanyId, currentCompanyCalendarDate);
        } else {
            console.error('No company selected for calendar navigation.');
        }
    });


    // --- 初期化 ---
    showView('calendar-view'); // 初期表示はカレンダー
});