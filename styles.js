const correctPassword = "1997"; // كلمة السر للدخول
const correctActionPassword = "0"; // كلمة السر لفتح، تحميل، أو حذف الملفات
const userEmail = "naseralswe@gmail.com"; // البريد الإلكتروني الذي سيتم إرسال كلمة السر إليه

// تحميل الشركات من LocalStorage عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function() {
    const companies = JSON.parse(localStorage.getItem("companies")) || [];
    companies.forEach(displayCompany);

    // تهيئة EmailJS
    emailjs.init("YOUR_USER_ID"); // استبدل YOUR_USER_ID بمعرف المستخدم الخاص بك من EmailJS
});

document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const loginPassword = document.getElementById("loginPassword").value;
    
    if (loginPassword === correctPassword) {
        document.getElementById("loginContainer").style.display = "none";
        document.getElementById("appContainer").style.display = "block";
    } else {
        document.getElementById("errorMessage").style.display = "block";
    }
});

document.getElementById("forgotPassword").addEventListener("click", function(event) {
    event.preventDefault();
    
    // إعداد بيانات البريد الإلكتروني
    const templateParams = {
        to_email: userEmail,
        message: `كلمة السر الخاصة بك هي: ${correctActionPassword}`
    };

    // إرسال البريد الإلكتروني باستخدام EmailJS
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
        .then(function(response) {
            alert("تم إرسال كلمة السر إلى بريدك الإلكتروني.");
        }, function(error) {
            alert("حدث خطأ أثناء إرسال البريد الإلكتروني. حاول مرة أخرى.");
            console.log('FAILED...', error);
        });
});

document.getElementById("addCompanyForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const companyNameInput = document.getElementById("companyNameInput");
    const companyIdInput = document.getElementById("companyIdInput");
    const fileInput = document.getElementById("fileInput");
    const passwordInput = document.getElementById("uploadPassword");

    if (passwordInput.value === correctActionPassword) {
        const companyName = companyNameInput.value;
        const companyId = companyIdInput.value;
        const files = fileInput.files;

        if (companyName && companyId && files.length > 0) {
            const companyFiles = [];

            // قراءة كل ملف وتحويله إلى base64
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const fileData = {
                        fileName: file.name,
                        fileContent: e.target.result // حفظ محتوى الملف كـ base64
                    };
                    companyFiles.push(fileData);

                    // بعد قراءة جميع الملفات، احفظ الشركة
                    if (companyFiles.length === files.length) {
                        const company = {
                            name: companyName,
                            id: companyId,
                            files: companyFiles // تخزين جميع الملفات
                        };

                        // التحقق من مساحة LocalStorage المتبقية
                        if (isLocalStorageFull()) {
                            alert("المساحة ممتلئة! لا يمكن إضافة المزيد من الشركات.");
                            return;
                        }

                        // حفظ الشركة في LocalStorage
                        const companies = JSON.parse(localStorage.getItem("companies")) || [];
                        companies.push(company);
                        localStorage.setItem("companies", JSON.stringify(companies));

                        displayCompany(company);

                        // إعادة تعيين الحقول
                        companyNameInput.value = "";
                        companyIdInput.value = "";
                        fileInput.value = "";
                        passwordInput.value = "";
                    }
                };

                reader.readAsDataURL(file); // قراءة الملف كـ Data URL
            });
        } else {
            alert("يرجى إدخال جميع البيانات وتحديد ملفات PDF.");
        }
    } else {
        alert("كلمة السر غير صحيحة!");
    }
});

function displayCompany(company) {
    const companyItem = document.createElement("div");
    companyItem.className = "company-item";

    const companyInfo = document.createElement("span");
    companyInfo.textContent = `اسم الشركة: ${company.name} | رقم القيد: ${company.id}`;

    companyItem.appendChild(companyInfo);

    // عرض كل ملف للشركة مع أزرار الفتح والتحميل
    company.files.forEach(file => {
        const fileItem = document.createElement("div");

        const fileName = document.createElement("span");
        fileName.textContent = `ملف: ${file.fileName}`;

        const openButton = document.createElement("button");
        openButton.textContent = "فتح";
        openButton.onclick = function () {
            const actionPassword = prompt("أدخل كلمة السر لفتح الملف:");
            if (actionPassword === correctActionPassword) {
                window.open(file.fileContent, '_blank');
            } else {
                alert("كلمة السر غير صحيحة!");
            }
        };

        const downloadButton = document.createElement("button");
        downloadButton.className = "download-btn";
        downloadButton.textContent = "تحميل";
        downloadButton.onclick = function () {
            const actionPassword = prompt("أدخل كلمة السر لتحميل الملف:");
            if (actionPassword === correctActionPassword) {
                const link = document.createElement('a');
                link.href = file.fileContent;
                link.download = file.fileName;
                link.click();
            } else {
                alert("كلمة السر غير صحيحة!");
            }
        };

        fileItem.appendChild(fileName);
        fileItem.appendChild(openButton);
        fileItem.appendChild(downloadButton);
        companyItem.appendChild(fileItem);
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "حذف الشركة";
    deleteButton.onclick = function () {
        const actionPassword = prompt("أدخل كلمة السر لحذف الشركة:");
        if (actionPassword === correctActionPassword) {
            companyList.removeChild(companyItem);

            let companies = JSON.parse(localStorage.getItem("companies")) || [];
            companies = companies.filter(c => c.id !== company.id);
            localStorage.setItem("companies", JSON.stringify(companies));
        } else {
            alert("كلمة السر غير صحيحة!");
        }
    };

    companyItem.appendChild(deleteButton);
    companyList.appendChild(companyItem);
}

// البحث عن الشركات بناءً على اسم الشركة أو رقم القيد
document.getElementById("searchButton").addEventListener("click", function () {
    const searchValue = document.getElementById("searchInput").value.toLowerCase();
    const companies = document.querySelectorAll(".company-item");

    companies.forEach(function (company) {
        const companyInfo = company.querySelector("span").textContent.toLowerCase();
        if (companyInfo.includes(searchValue)) {
            company.style.display = "";
        } else {
            company.style.display = "none";
        }
    });
});

// وظيفة للتحقق من امتلاء LocalStorage
function isLocalStorageFull() {
    try {
        // محاولة تخزين بيانات اختبارية
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return false;
    } catch (e) {
        return true; // LocalStorage ممتلئة
    }
}