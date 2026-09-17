/* Customer-facing Russian translation; original English content and stored data stay intact. */
(()=>{
  const query=new URLSearchParams(location.search).get('lang');
  const lang=query==='ru'||query==='en'?query:(localStorage.getItem('demi-lang')==='ru'?'ru':'en');
  if(query==='ru'||query==='en')localStorage.setItem('demi-lang',lang);
  document.documentElement.lang=lang;
  if(lang!=='ru')return;

  const copy={
    'SHOP':'МАГАЗИН','SHOP ALL':'ВСЕ ТОВАРЫ','GALLERY':'ГАЛЕРЕЯ','ABOUT':'О НАС','LOGIN':'ВХОД',
    'INSTAGRAM':'INSTAGRAM','CONTACT':'КОНТАКТЫ','CART':'КОРЗИНА','REGISTER':'РЕГИСТРАЦИЯ',
    'ACCOUNT':'АККАУНТ','CLIENT SERVICES':'ПОДДЕРЖКА КЛИЕНТОВ','LOGIN / REGISTER':'ВХОД / РЕГИСТРАЦИЯ',
    'BAG':'КОРЗИНА','MENU':'МЕНЮ','SUPPORT':'ПОДДЕРЖКА','SEND A MESSAGE':'ОТПРАВИТЬ СООБЩЕНИЕ',
    'START A CHAT':'НАЧАТЬ ЧАТ','Thanks for stopping by! How can I help you?':'Спасибо, что заглянули! Чем я могу помочь?',
    'SEND':'ОТПРАВИТЬ','SENDING…':'ОТПРАВКА…','THANK YOU. YOUR MESSAGE HAS BEEN SENT.':'СПАСИБО. ВАШЕ СООБЩЕНИЕ ОТПРАВЛЕНО.',
    'PLEASE CHECK YOUR EMAIL AND MESSAGE.':'ПРОВЕРЬТЕ АДРЕС ПОЧТЫ И СООБЩЕНИЕ.',
    'JACKETS & COATS':'КУРТКИ И ПАЛЬТО',
    'JEANS, PANTS & SHORTS':'ДЖИНСЫ, БРЮКИ И ШОРТЫ','TOPS':'ВЕРХ','BAGS & ACCESSORIES':'СУМКИ И АКСЕССУАРЫ',
    'Register':'Регистрация','Login':'Вход','Name':'Имя','Password':'Пароль','Create Account':'Создать аккаунт',
    'Save login details':'Сохранить данные для входа','Email me with news and offers':'Присылать новости и предложения на почту',
    'Logout':'Выйти','Log out':'Выйти','My account':'Мой аккаунт',
    'SIZE*':'РАЗМЕР*','SIZE':'РАЗМЕР','Select your size':'Выберите размер','Add To Bag':'Добавить в корзину',
    'Buy Now':'Купить сейчас','DESCRIPTION':'ОПИСАНИЕ','FABRIC':'МАТЕРИАЛ',
    'DELIVERY AND EXCHANGES / REFUND':'ДОСТАВКА, ОБМЕН И ВОЗВРАТ',
    'Choose the size above. Fit information can be edited from the admin panel.':'Выберите размер выше. Информацию о посадке можно изменить в панели администратора.',
    'Shipping and returns policy can be customized in the admin panel.':'Условия доставки и возврата можно изменить в панели администратора.',
    'Product not found.':'Товар не найден.','Product added to bag':'Товар добавлен в корзину',
    'Your bag is empty.':'Ваша корзина пуста.','Check Out':'Оформить заказ',
    'PayPal':'PayPal','ApplePay':'ApplePay','GooglePay':'GooglePay','Crypto payment':'Оплата криптовалютой',
    'Card payment':'Оплата картой','Kontakt':'Контакты','Delivery':'Доставка',
    'coutry/region':'Страна/регион','Poland':'Польша','Ukraine':'Украина','Germany':'Германия','France':'Франция',
    'United States':'США','First Name':'Имя','Last Name':'Фамилия','Address':'Адрес',
    'Apartment, suite, etc. (optional)':'Квартира, офис и т. д. (необязательно)',
    'Postal Code':'Почтовый индекс','City':'Город','Phone':'Телефон',
    'Save this information for next time':'Сохранить данные для следующего раза',
    'Text me with news and offers':'Присылать новости и предложения по SMS',
    'By signing up via text, you agree to receive recurring automated marketing messages, including cart reminders, at the phone number provided. Consent is not a condition of purchase. Reply STOP to unsubscribe. Reply HELP for help. Message frequency varies. Msg & data rates may apply. View our ':'Подписываясь на SMS, вы соглашаетесь получать сообщения о предложениях и корзине на указанный номер. Согласие не обязательно для покупки. Отправьте STOP для отказа или HELP для помощи. Частота сообщений различается; возможна плата за связь. Ознакомьтесь с ',
    'Privacy policy':'Политикой конфиденциальности','Terms of service':'Условиями обслуживания','and':'и',
    'Review order':'Проверить заказ','Order summary':'Состав заказа','Discount Code':'Промокод','Apply':'Применить',
    'Subtotal':'Сумма товаров','Shipping':'Доставка','Total':'Итого',
    'Terms and polices':'Условия и правила','No products yet.':'Товаров пока нет.',
    'No gallery items.':'Пока нет фотографий.','Always up to date: unsigned1':'Всегда в курсе: unsigned1',
    'Section not found':'Раздел не найден','Page not found.':'Страница не найдена.','Back home':'На главную',
    'Invitation T-Shirt - Black':'Футболка Invitation — чёрная',
    'Human Uniform Longsleeve Black&White':'Лонгслив Human Uniform — чёрно-белый',
    'Lobby Hoody Black&White':'Худи Lobby — чёрно-белое',
    'Inside Jeans- Black Black':'Джинсы Inside — чёрные',
    'Invitation T-Shirt':'Футболка Invitation','Human Uniform Longsleeve':'Лонгслив Human Uniform',
    'Lobby Hoody':'Худи Lobby','Inside Jeans- Black':'Джинсы Inside — чёрные',
    'Black&White':'Чёрно-белый','Black':'Чёрный',
    'Black invitation graphic T-shirt.':'Чёрная футболка Invitation с графическим принтом.',
    'Human Uniform long sleeve with striped sleeves and graphic details.':'Лонгслив Human Uniform с полосатыми рукавами и графическим принтом.',
    'Oversized black and white lobby hoodie.':'Свободное чёрно-белое худи Lobby.',
    'Black jeans with contrast inside-out pocket details.':'Чёрные джинсы с контрастными деталями карманов.',
    'Cotton blend':'Смесь хлопка','Cotton jersey':'Хлопковый трикотаж',
    'Heavy cotton fleece':'Плотный хлопковый флис','Denim':'Деним',
    'YOUR EMAIL':'ВАША ПОЧТА','HOW CAN WE HELP?':'ЧЕМ МЫ МОЖЕМ ПОМОЧЬ?',
    'OPEN ADMIN PANEL':'ОТКРЫТЬ АДМИН-ПАНЕЛЬ',
    'Enter a valid name, email and password (6+ characters).':'Укажите корректные имя, почту и пароль (от 6 символов).',
    'Email already registered.':'Этот адрес почты уже зарегистрирован.',
    'Wrong email or password.':'Неверный адрес почты или пароль.',
    'Enter a valid email and message.':'Укажите корректные адрес почты и сообщение.',
    'Registration failed':'Не удалось зарегистрироваться','Login failed':'Не удалось войти',
    'Cart is empty.':'Корзина пуста.','Could not create order':'Не удалось оформить заказ',
    'Order ':'Заказ ', ' created.':' создан.',
    'DEMI DEVILLE Admin':'DEMI DEVILLE — админ-панель',
    'Use an administrator account.':'Войдите с учётной записью администратора.',
    'Change the default password immediately after first login.':'Смените стандартный пароль сразу после первого входа.',
    'Site settings':'Настройки сайта','Products':'Товары','Gallery':'Галерея',
    'Custom sections':'Дополнительные разделы','Orders':'Заказы','Security':'Безопасность',
    'Open website ↗':'Открыть сайт ↗','Brand':'Бренд','Home title':'Заголовок главной',
    'Desktop hero image URL':'Фоновое изображение для ПК','Mobile hero image URL':'Фоновое изображение для телефона',
    'Login artwork URL':'Изображение на странице входа','Contact email':'Контактная почта',
    'Instagram URL':'Ссылка на Instagram','Support button text':'Текст кнопки поддержки',
    'Main font CSS stack':'Основной шрифт CSS','Logo/display font CSS stack':'Шрифт логотипа CSS',
    'Condensed font CSS stack':'Узкий шрифт CSS','Base font size (px)':'Основной размер шрифта (пикс.)',
    'Shipping amount':'Стоимость доставки','Currency symbol':'Символ валюты',
    'About page HTML/text':'Текст страницы «О нас» (HTML)',
    'Save settings':'Сохранить настройки','Tip:':'Подсказка:',
    'image fields accept local uploaded images from this admin panel or normal HTTPS image URLs.':'в поля изображений можно добавить файлы с устройства или ссылки HTTPS.',
    '+ Add product':'+ Добавить товар','+ Add image':'+ Добавить изображение',
    '+ Add section':'+ Добавить раздел',
    'Create extra pages. They appear in the mobile menu automatically.':'Создавайте страницы, которые автоматически появятся в мобильном меню.',
    'Change admin password':'Изменить пароль администратора','Current password':'Текущий пароль',
    'New password':'Новый пароль','Change password':'Изменить пароль',
    'Local admin login':'Локальный вход в админку',
    'These are seed credentials only. Change the password before deployment.':'Это исходные данные для входа. Смените пароль до публикации сайта.',
    'Edit':'Редактировать','Delete':'Удалить','Saved':'Сохранено','Deleted':'Удалено',
    'Settings saved':'Настройки сохранены','Image uploaded':'Изображение загружено',
    'Image uploaded. Save settings to apply.':'Изображение загружено. Сохраните настройки для применения.',
    'No products.':'Товаров нет.','No custom sections yet.':'Дополнительных разделов пока нет.',
    'No orders.':'Заказов нет.','Gallery image':'Изображение галереи',
    'ID / slug':'ID / адрес','Email':'Электронная почта','Price':'Цена','Sort':'Порядок',
    'Image URL':'Ссылка на изображение','Sizes, comma separated':'Размеры через запятую',
    'Fabric':'Материал','Visible':'Показывать','Description':'Описание','Yes':'Да','No':'Нет',
    'Cancel':'Отмена','Save':'Сохранить','Caption':'Подпись','Title':'Заголовок',
    'Slug':'Адрес страницы','Content (HTML allowed)':'Содержимое (можно HTML)',
    'Product':'Товар','Gallery item':'Элемент галереи','Custom section':'Дополнительный раздел',
    'Order status updated':'Статус заказа обновлён','Password changed':'Пароль изменён',
    'Delete this item?':'Удалить этот элемент?','This account is not an administrator.':'У этой учётной записи нет прав администратора.',
    'Request failed':'Не удалось выполнить запрос','Unauthorized':'Необходим вход',
    'Admin only':'Только для администратора','Not found':'Не найдено',
    'New password must be at least 8 characters.':'Новый пароль должен содержать не менее 8 символов.',
    'Current password is wrong.':'Неверный текущий пароль.',
    'new':'новый','paid':'оплачен','shipped':'отправлен','completed':'завершён',
    'cancelled':'отменён','hidden':'скрыт','visible':'показан',
    'Remove item':'Удалить товар','Increase quantity':'Увеличить количество',
    'Decrease quantity':'Уменьшить количество','Quantity':'Количество','Cart':'Корзина',
    'Shop categories':'Категории магазина','Account links':'Аккаунт','Payment method':'Способ оплаты',
    'Close support':'Закрыть поддержку', 'e-mail':'Электронная почта'
  };
  const titles={Shop:'Магазин',Login:'Вход',Bag:'Корзина',Checkout:'Оплата',Gallery:'Галерея',About:'О нас',Product:'Товар',Section:'Раздел'};
  for(const [en,ru] of Object.entries(titles))if(document.title.startsWith(en+' —'))document.title=ru+document.title.slice(en.length);
  if(document.title==='DEMI DEVILLE Admin')document.title='DEMI DEVILLE — админ-панель';
  const attrNames=['placeholder','aria-label','alt','title'];
  function translated(value){
    if(location.pathname.startsWith('/admin')&&value==='Name')return 'Название';
    if(copy[value])return copy[value];
    if(location.pathname.startsWith('/admin')&&/\b(sort \d+|visible|hidden)\b/.test(value))return value.replace('sort','порядок').replace(/\bhidden\b/g,'скрыт').replace(/\bvisible\b/g,'показан');
    if(/^Cart \(\d+\)$/.test(value))return value.replace('Cart','Корзина');
    if(/^(Black&White|Black) - \d+(?:[.,]\d+)?\$$/.test(value))return value.replace(/^Black&White/, 'Чёрно-белый').replace(/^Black/, 'Чёрный');
    // Preserve prices, links and order numbers in mixed text nodes.
    const match=value.match(/^(\s*)(.*?)(\s*)$/s);
    return match&&copy[match[2]]?match[1]+copy[match[2]]+match[3]:value;
  }
  function translate(root){
    if(root.nodeType===Node.TEXT_NODE){
      if(root.parentElement?.closest('script,style'))return;
      const next=translated(root.nodeValue);
      if(next!==root.nodeValue)root.nodeValue=next;
      return;
    }
    if(root.nodeType!==Node.ELEMENT_NODE)return;
    if(root.matches('script,style'))return;
    // Native select options without a value use their visible label as the
    // submitted value. Preserve the original code before translating the label.
    if(root.tagName==='OPTION'&&!root.hasAttribute('value'))root.setAttribute('value',root.textContent);
    for(const name of attrNames){
      const value=root.getAttribute(name);
      if(value){const next=translated(value);if(next!==value)root.setAttribute(name,next);}
    }
    if(root.tagName==='INPUT'&&root.type==='submit'&&copy[root.value])root.value=copy[root.value];
    for(const node of root.childNodes)translate(node);
  }
  window.ddTranslate=translated;
  translate(document.body);
  const lastName=document.querySelector('.checkout-form input[name=lastName]');
  if(lastName)lastName.placeholder='Фамилия';
  const observer=new MutationObserver(records=>{
    for(const record of records){
      if(record.type==='characterData')translate(record.target);
      else if(record.type==='childList')record.addedNodes.forEach(translate);
      else if(record.type==='attributes')translate(record.target);
    }
  });
  observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:attrNames});
})();
