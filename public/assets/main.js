const pathname = location.pathname;
if(['/register', '/login'].some(p => p === pathname)){
  try {
    fetch('/auth/session', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
    .then(res => res.json())
    .then(data => {
      if(typeof data.authentication === "object"){
        return window.location.href = window.origin;
      }
    })
  } catch {}
}


const doc = window.document;
const $footer = doc.querySelector(".footer");
const currentYear = new Date().getFullYear();
const COMPANY_NAME = "Your Company";
if($footer){
  $footer.textContent = $footer.textContent?.replace('2024', `${currentYear} ${COMPANY_NAME}`);
}

const $passwords = doc.querySelectorAll(".hidden-password");
if($passwords.length)
for (let $password of $passwords) {
  $password.addEventListener('click', function () {
    for (let $icon of $password.children) {
      const isHidden = $icon.classList.contains('hidden');
      const $input = $password.parentElement.children.item(1);
      if (isHidden) {
        $icon.classList.remove('hidden');
        $input.setAttribute("type", "text");
      } else {
        $icon.classList.add('hidden')
        $input.setAttribute("type", "password");
      }
    }
  });
}
const $errorMessage = doc.querySelector('.error-message');
const $inputs = doc.querySelectorAll("input");
if($inputs.length)
for (let $input of $inputs) {
  $input.addEventListener('input', function (e) {
    if (!$errorMessage?.classList.contains('hidden'))
      $errorMessage.classList.add('hidden')
  })
}

function isValidEmail(email) {
  return /^(([^<>()[\]\\.,;:#\s@"]+(\.[^<>()[\]\\.,;:#\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    .test(email.toLowerCase())
}
function invalidPassword(value) {
  if (value.length < 6) {
    return "Password must be at least 6 characters long";
  }

  if (!/[A-Z]/.test(value)) {
    return "Password must contain at least one uppercase letter";
  }

  if (!/[a-z]/.test(value)) {
    return "Password must contain at least one lowercase letter";
  }

  if (!/[0-9]/.test(value)) {
    return "Password must contain at least one number";
  }

  if (value.length > 60) {
    return "Password is too long";
  }
}