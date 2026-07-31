var contactName = document.getElementById("contactName");
var contactPhone = document.getElementById("contactPhone");
var contactEmail = document.getElementById("contactEmail");
var nameError = document.getElementById("nameError");
var phoneError = document.getElementById("phoneError");
var emailError = document.getElementById("emailError");
var contactAddress = document.getElementById("contactAddress");
var contactGroup = document.getElementById("contactGroup");
var favoriteCheck = document.getElementById("favoriteCheck");
var emergencyCheck = document.getElementById("emergencyCheck");
var userImage = document.getElementById("fileInput");
var row = document.getElementById("contactRow");
var arrayCount = document.querySelector(".array-length");
var tatalCount = document.querySelector(".total-count");
var favoriteCount = document.querySelector(".favoriteCount");
var emergencyCount = document.querySelector(".emergencyCount");
var userIcon = document.querySelector(".user-icon");
var contactImage = "";
// Shared SweetAlert2 instance: scrollbarPadding disabled so the fixed navbar
// doesn't get pushed to the right when an alert opens and hides the scrollbar
var SwalBox = Swal.mixin({
  scrollbarPadding: false,
});
var isEditMode = false;
var currentEditIndex;
var ContactList = [];
var favoriteContacts = [];
var emergencyContacts = [];

// Hoisting
resetUserAvatar();
loadContacts();
checkFavoriteSection();
checkEmergencySection();
userImage.addEventListener("change", function () {
  var file = userImage.files[0];
  if (file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      contactImage = e.target.result;
      document.querySelector(".user-icon").innerHTML = `
        <img 
          src="${contactImage}" 
          class="w-100 h-100 rounded-circle object-fit-cover"
        >
      `;
    };
    reader.readAsDataURL(file);
  }
});
/* ============ Live Field Validation ============ */
// Regex rules
var nameRegex = /^[A-Za-z\u0600-\u06FF\s]{2,50}$/;
var egyptPhoneRegex = /^01[0125][0-9]{8}$/;
var emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

function validateNameValue(value) {
  if (value.trim() === "") return "Name is required";
  if (!nameRegex.test(value))
    return "Name should contain only letters and spaces (2-50 characters)";
  return "";
}
function validatePhoneValue(value) {
  if (value.trim() === "") return "Phone number is required";
  if (!egyptPhoneRegex.test(value))
    return "Please enter a valid Egyptian phone number";
  return "";
}
function validateEmailValue(value) {
  if (value.trim() === "") return "";
  if (!emailRegex.test(value)) return "Please enter a valid email address";
  return "";
}
// Show / clear the message + red or green border under an input as the user types
function showFieldError(input, errorEl, message) {
  if (message) {
    errorEl.textContent = message;
    input.classList.add("is-invalid-field");
    input.classList.remove("is-valid-field");
  } else {
    errorEl.textContent = "";
    input.classList.remove("is-invalid-field");
    if (input.value.trim() !== "") {
      input.classList.add("is-valid-field");
    } else {
      input.classList.remove("is-valid-field");
    }
  }
}
function clearFieldErrors() {
  [contactName, contactPhone, contactEmail].forEach(function (input) {
    input.classList.remove("is-invalid-field", "is-valid-field");
  });
  nameError.textContent = "";
  phoneError.textContent = "";
  emailError.textContent = "";
}
// Live validation while typing
contactName.addEventListener("input", function () {
  showFieldError(contactName, nameError, validateNameValue(contactName.value));
});
contactPhone.addEventListener("input", function () {
  showFieldError(
    contactPhone,
    phoneError,
    validatePhoneValue(contactPhone.value),
  );
});
contactEmail.addEventListener("input", function () {
  showFieldError(
    contactEmail,
    emailError,
    validateEmailValue(contactEmail.value),
  );
});
// Full form check run on submit. excludeIndex is the current contact's index while editing,
// so it isn't flagged as a duplicate of itself. Pass -1 when adding a new contact.
function checkFormValidation(excludeIndex) {
  var nameMsg = validateNameValue(contactName.value);
  var phoneMsg = validatePhoneValue(contactPhone.value);
  var emailMsg = validateEmailValue(contactEmail.value);

  showFieldError(contactName, nameError, nameMsg);
  showFieldError(contactPhone, phoneError, phoneMsg);
  showFieldError(contactEmail, emailError, emailMsg);

  if (contactName.value.trim() === "") {
    SwalBox.fire({
      icon: "error",
      title: "Missing Name",
      text: "Please enter a full name!",
      confirmButtonColor: "#7827fb",
    });
    return false;
  }
  if (nameMsg) {
    SwalBox.fire({
      icon: "error",
      title: "Invalid Name",
      text: nameMsg,
      confirmButtonColor: "#7827fb",
    });
    return false;
  }
  if (contactPhone.value.trim() === "") {
    SwalBox.fire({
      icon: "error",
      title: "Missing Phone",
      text: "Please enter a phone number!",
      confirmButtonColor: "#7827fb",
    });
    return false;
  }
  if (phoneMsg) {
    SwalBox.fire({
      icon: "error",
      title: "Invalid Phone",
      text: phoneMsg,
      confirmButtonColor: "#7827fb",
    });
    return false;
  }
  if (emailMsg) {
    SwalBox.fire({
      icon: "error",
      title: "Invalid Email",
      text: emailMsg,
      confirmButtonColor: "#7827fb",
    });
    return false;
  }
  var duplicate = ContactList.find(function (c, idx) {
    return c.phone === contactPhone.value && idx !== excludeIndex;
  });
  if (duplicate) {
    SwalBox.fire({
      icon: "error",
      title: "Duplicate Phone Number",
      text:
        "A contact with this phone number already exists: " + duplicate.name,
      confirmButtonColor: "#7827fb",
    });
    return false;
  }
  return true;
}
/* ============ End Live Field Validation ============ */

// Check on start if local storage has data or not
function loadContacts() {
  if (localStorage.getItem("ContactArray")) {
    ContactList = JSON.parse(localStorage.getItem("ContactArray"));

    for (var i = 0; i < ContactList.length; i++) {
      if (ContactList[i].favorite == undefined) {
        ContactList[i].favorite = false;
      }
      if (ContactList[i].emergency == undefined) {
        ContactList[i].emergency = false;
      }
    }
    displayContact(ContactList);
  } else {
    row.innerHTML = ` <div
                class="contact-list d-flex gap-2 flex-column justify-content-center align-items-center py-5 my-5"
              >
                <i
                  class="fa-solid fa-address-book mb-2 fs-3 d-flex justify-content-center align-items-center main-rounded"
                ></i>
                <h4 class="fs-6 text-muted">No contacts found</h4>
                <p class="text-sm text-body-tertiary">
                  Click "Add Contact" to get started
                </p>
              </div>`;
  }
}
// To Add new contact
function AddContact() {
  if (!checkFormValidation(-1)) {
    return false;
  }
  var contact = {
    name: contactName.value,
    phone: contactPhone.value,
    email: contactEmail.value,
    address: contactAddress.value,
    group: contactGroup.value,
    favorite: favoriteCheck.checked,
    emergency: emergencyCheck.checked,
    image: contactImage,
  };
  ContactList.push(contact);
  // after push data in array load the new data in local storage
  localStorage.setItem("ContactArray", JSON.stringify(ContactList));
  checkFavoriteSection();
  checkEmergencySection();
  displayContact(ContactList);
  ClearInputValue();
  SwalBox.fire({
    icon: "success",
    title: "Added!",
    text: "Contact has been added successfully.",
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
  });
  return true;
}
function displayContact(array) {
  var cartona = "";
  for (var i = 0; i < array.length; i++) {
    var originalIndex = ContactList.indexOf(array[i]);
    cartona += `
<div class="col-12 col-lg-6 mb-4 d-flex">
  <div class="contact-card h-100 w-100 bg-white main-rounded border border-2 border-dark border-opacity-10 d-flex flex-column">
    <!-- Top -->
    <div class="d-flex gap-3 p-3">
      <!-- Avatar -->
      <div class="position-relative">
        <div
          class="avatar ${getAvatarClass(array[i].name)} d-flex justify-content-center align-items-center text-white fw-bold fs-5 main-rounded overflow-hidden"
        >
          ${
            array[i].image
              ? `
                <img
                  src="${array[i].image}"
                  class="w-100 h-100 object-fit-cover"
                >
              `
              : array[i].name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()
          }
        </div>
        ${
          array[i].favorite
            ? `
            <div
              class="favorite-badge rounded-circle bg-warning position-absolute flex-center border border-3 border-white text-white"
            >
              <i class="fas fa-star"></i>
            </div>
          `
            : ""
        }
        ${
          array[i].emergency
            ? `
            <div
              class="emergency-badge rounded-circle position-absolute flex-center border border-3 border-white text-white"
            >
              <i class="fas fa-heart-pulse"></i>
            </div>
          `
            : ""
        }
      </div>
      <!-- Info -->
      <div class="w-100">
        <h3 class="fw-semibold fs-6 pb-2">
          ${array[i].name}
        </h3>
        <div class="d-flex align-items-center gap-2 text-secondary">
          <div
            class="info-icon flex-center  text-primary rounded-2"
          >
            <i class="fas fa-phone text-xxs  text-bg-blue rounded-2 flex-center"></i>
          </div>
          <span class="text-sm">
            ${array[i].phone}
          </span>
        </div>
      </div>
    </div>
    <!-- Extra Data -->
    <div class="d-flex flex-column gap-3 ps-3 pb-3 flex-grow-1">
      ${
        array[i].email
          ? `
          <div class="d-flex gap-2 text-secondary">
            <div
              class="text-bg-purple flex-center p-2 text-xxs rounded-3"
            >
              <i class="fas fa-envelope"></i>
            </div>
            <span>
              ${array[i].email}
            </span>
          </div>
        `
          : ""
      }
      ${
        array[i].address
          ? `
          <div class="d-flex gap-2 text-secondary">
            <div
              class="text-bg-green text-success flex-center p-2 text-xxs rounded-3"
            >
              <i class="fas fa-location-dot"></i>
            </div>
            <span>
              ${array[i].address}
            </span>
          </div>
        `
          : ""
      }
      <div class="d-flex gap-2">
        ${
          array[i].group != "Select a group"
            ? `
            <div
              class="${groupBadge(array[i].group)} text-xs badge"
            >
              ${array[i].group}
            </div>
          `
            : ""
        }
        ${
          array[i].emergency
            ? `
            <div class="emergency-active text-xs badge">
              <i class="fas fa-heart-pulse"></i>
              Emergency
            </div>
          `
            : ""
        }
      </div>
    </div>
    <!-- Footer -->
    <div
      class="border-top p-3 d-flex justify-content-between align-items-center mt-auto"
    >
      <!-- Left -->
      <div class="d-flex gap-2">
        <a
          href="tel:${array[i].phone}"
          class="text-bg-green px-2 py-1 rounded-3 text-success"
        >
          <i class="fas fa-phone"></i>
        </a>
        ${
          array[i].email
            ? `
            <button
              class="text-bg-purple border-0 px-2 py-1 rounded-3"
            >
              <i class="fas fa-envelope"></i>
            </button>
          `
            : ""
        }
      </div>
      <!-- Right -->
      <div class="d-flex gap-2">
        <button
          onclick="toggleFavorite(${i})"
          class="action-btn rounded-3 py-1 px-2
          ${array[i].favorite ? "favorite-active" : ""}"
        >
          <i class="py-1 px-2 flex-center fa-star
          ${array[i].favorite ? "fas" : "far"}"></i>
        </button>
        <button
          onclick="toggleEmergency(${i})"
          class="action-btn rounded-3 py-1 px-2
          ${array[i].emergency ? "emergency-active" : ""}"
        >
          <i class="py-1 px-2 flex-center
          ${array[i].emergency ? "fas fa-heart-pulse" : "far fa-heart"}"></i>
        </button>
        <button
          onclick="editContact(${originalIndex})"
          class="action-btn edit rounded-3 py-1 px-2"
        >
          <i class="py-1 px-2 flex-center fas fa-pen"></i>
        </button>
        <button
          onclick="deleteContact(${originalIndex})"
          class="action-btn delete rounded-3 py-1 px-2"
        >
          <i class="flex-center fas fa-trash"></i>
        </button>
      </div>
    </div>
  </div>
</div>
`;
  }
  row.innerHTML = cartona;
  arrayCount.innerHTML = `${ContactList.length}`;
  tatalCount.innerHTML = `${ContactList.length}`;
}
// Edit Contact Function
function editContact(index) {
  isEditMode = true;
  currentEditIndex = index;
  clearFieldErrors();
  layerToggle();
  contactName.value = ContactList[index].name;
  contactPhone.value = ContactList[index].phone;
  contactEmail.value = ContactList[index].email;
  contactAddress.value = ContactList[index].address;
  contactGroup.value = ContactList[index].group;
  favoriteCheck.checked = ContactList[index].favorite;
  emergencyCheck.checked = ContactList[index].emergency;
  contactImage = ContactList[index].image;
  if (contactImage) {
    userIcon.innerHTML = `
    <img
      src="${contactImage}"
      class="w-100 h-100 rounded-circle object-fit-cover"
    >
  `;
  } else {
    resetUserAvatar();
  }
  // Change title
  document.querySelector(".submit-btn").innerHTML =
    `<i class="fas fa-check text-xs pe-3"></i>Update Contact`;
  // Change button text
  document.querySelector(".layer h4").innerHTML = "Edit Contact";
}
function updateContact() {
  if (!checkFormValidation(currentEditIndex)) {
    return false;
  }
  ContactList[currentEditIndex] = {
    name: contactName.value,
    phone: contactPhone.value,
    email: contactEmail.value,
    address: contactAddress.value,
    group: contactGroup.value,
    favorite: favoriteCheck.checked,
    emergency: emergencyCheck.checked,
    image: contactImage,
  };
  localStorage.setItem("ContactArray", JSON.stringify(ContactList));
  displayContact(ContactList);
  checkFavoriteSection();
  checkEmergencySection();
  ClearInputValue();
  // Reset Edit Mode
  resetFormState();
  searchContact.value = "";
  SwalBox.fire({
    icon: "success",
    title: "Updated!",
    text: "Contact has been updated successfully.",
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
  });
  return true;
}
// Search by name only
var searchContact = document.getElementById("SearchInput");
searchContact.addEventListener("input", searchFromName);
function searchFromName() {
  var searchArray = [];
  for (i = 0; i < ContactList.length; i++) {
    if (
      ContactList[i].name
        .toLowerCase()
        .includes(searchContact.value.trim().toLowerCase()) ||
      ContactList[i].phone.includes(searchContact.value)
    ) {
      searchArray.push(ContactList[i]);
    }
  }
  displayContact(searchArray);
}
// Delete Contact Function
function deleteContact(index) {
  var contactToDelete = ContactList[index];
  SwalBox.fire({
    icon: "warning",
    title: "Delete Contact?",
    text:
      "Are you sure you want to delete " +
      contactToDelete.name +
      "? This action cannot be undone.",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#ff2056",
    cancelButtonColor: "#6b7280",
    reverseButtons: false,
  }).then(function (result) {
    if (result.isConfirmed) {
      ContactList.splice(index, 1);
      localStorage.setItem("ContactArray", JSON.stringify(ContactList));
      displayContact(ContactList);
      checkFavoriteSection();
      checkEmergencySection();
      searchContact.value = "";
      SwalBox.fire({
        icon: "success",
        title: "Deleted!",
        text: "Contact has been deleted.",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    }
  });
}
// Clear Inpusts value in your form
function ClearInputValue() {
  contactName.value = "";
  contactPhone.value = "";
  contactEmail.value = "";
  contactAddress.value = "";
  contactGroup.value = "";
  favoriteCheck.checked = false;
  emergencyCheck.checked = false;
  contactImage = "";
  userImage.value = "";
  resetUserAvatar();
  clearFieldErrors();
}
function resetUserAvatar() {
  userIcon.innerHTML = `
    <i class="fas fa-user fs-3 text-white"></i>
  `;
}
// Chick what group you choose
function groupBadge(group) {
  if (group == "Family") {
    return "bg-primary-subtle text-primary";
  } else if (group == "Friends") {
    return "bg-success-subtle text-success";
  } else if (group == "Work") {
    return "text-bg-purple ";
  } else if (group == "School") {
    return "bg-warning-subtle text-warning-emphasis";
  } else if (group == "Other") {
    return "bg-secondary-subtle text-secondary";
  }
}
// To reset Form after cancel the edit
function resetFormState() {
  ClearInputValue();
  isEditMode = false;
  currentEditIndex = -1;
  document.querySelector(".submit-btn").innerHTML =
    `<i class="fas fa-check text-xs pe-3"></i>Save Contact`;
  document.querySelector(".layer h4").innerHTML = "Add New Contact";
  userIcon.innerHTML = `
    <i class="fas fa-user fs-3 text-white"></i>
  `;
}
// To can show or unshow a layer of a form
var navBtn = document.querySelector(".nav-btn");
var layer = document.querySelector(".layer");
var closeIcon = document.querySelector(".close-icon");
var cancelBtn = document.querySelector(".cancel-btn");
var form = document.querySelector("form");
form.addEventListener("submit", function (e) {
  e.preventDefault();
  var saved = isEditMode ? updateContact() : AddContact();
  if (saved) {
    layerToggle();
  }
});
navBtn.addEventListener("click", layerToggle);
closeIcon.addEventListener("click", function () {
  resetFormState();
  layerToggle();
});
cancelBtn.addEventListener("click", function () {
  resetFormState();
  layerToggle();
});
// To can toggle the display none or not
function layerToggle() {
  layer.classList.toggle("d-none");
}
//***  Update Favorite && Emegency arrays
function updateArrays() {
  favoriteContacts = ContactList.filter((contact) => contact.favorite);
  emergencyContacts = ContactList.filter((contact) => contact.emergency);
  favoriteCount.innerHTML = `${favoriteContacts.length}`;
  emergencyCount.innerHTML = `${emergencyContacts.length}`;
}
//***  Select or unselect Favorite Contact
function toggleFavorite(index) {
  ContactList[index].favorite = !ContactList[index].favorite;
  localStorage.setItem("ContactArray", JSON.stringify(ContactList));
  displayContact(ContactList);
  checkFavoriteSection();
}
function checkFavoriteSection() {
  updateArrays();
  if (favoriteContacts.length > 0) {
    console.log("nonfav");
    displayFavoriteContacts();
  } else {
    document.getElementById("favoriteRow").innerHTML = `
      <div
        class="flex-center p-2 rounded-3 py-5 text-body-tertiary text-sm"
      >
        No favorites yet
      </div>
    `;
  }
}
function displayFavoriteContacts() {
  let cartona = "";
  for (let i = 0; i < favoriteContacts.length; i++) {
    cartona += `
      <div class="col-12">
        <div
          class="fav_contact main-rounded p-2 d-flex align-items-center justify-content-between"
        >
          <div class="d-flex gap-2 align-items-center flex-grow-1 overflow-hidden">
            <div
              class="${getAvatarClass(favoriteContacts[i].name)} fav_img icon overflow-hidden d-flex justify-content-center align-items-center text-white fw-bold"
            >
          ${
            favoriteContacts[i].image
              ? `
      <img
        src="${favoriteContacts[i].image}"
        alt="${favoriteContacts[i].name}"
        class="w-100 h-100 object-fit-cover"
      >
    `
              : favoriteContacts[i].name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()
          }
            </div>
            <div class="flex-grow-1 overflow-hidden">
              <h3 class="text-sm mb-0 text-truncate">
                ${favoriteContacts[i].name}
              </h3>
              <p class="text-xs text-body-secondary mb-0 text-truncate">
                ${favoriteContacts[i].phone}
              </p>
            </div>
          </div>
          <a
            href="tel:${favoriteContacts[i].phone}"
            class="px-2 py-1 rounded-3 phoneFavIcon ms-2"
          >
            <i class="fas fa-phone"></i>
          </a>
        </div>
      </div>
    `;
  }
  document.getElementById("favoriteRow").innerHTML = cartona;
}
function toggleEmergency(index) {
  ContactList[index].emergency = !ContactList[index].emergency;
  localStorage.setItem("ContactArray", JSON.stringify(ContactList));
  displayContact(ContactList);
  updateArrays();
  checkEmergencySection();
}
function checkEmergencySection() {
  updateArrays();
  if (emergencyContacts.length > 0) {
    displayEmergencyContacts();
  } else {
    document.getElementById("emergencyRow").innerHTML = `
    <div
        class="d-flex justify-content-center align-items-center py-5 text-body-tertiary text-sm"
                    >
                      No emergency contacts
                    </div>
    `;
  }
}
function displayEmergencyContacts() {
  var cartona = "";
  for (var i = 0; i < emergencyContacts.length; i++) {
    cartona += `
        <div class="col-12">
        <div
          class="emergency_contact main-rounded p-2 d-flex align-items-center justify-content-between"
        >
          <div class="d-flex gap-2 align-items-center flex-grow-1 overflow-hidden">
            <div
              class="${getAvatarClass(emergencyContacts[i].name)} emergency_img icon overflow-hidden d-flex justify-content-center align-items-center text-white fw-bold"
            >
          ${
            emergencyContacts[i].image
              ? `
      <img
        src="${emergencyContacts[i].image}"
        alt="${emergencyContacts[i].name}"
        class="w-100 h-100 object-fit-cover"
      >
    `
              : emergencyContacts[i].name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()
          }
            </div>
            <div class="flex-grow-1 overflow-hidden">
              <h3 class="text-sm mb-0 text-truncate">
                ${emergencyContacts[i].name}
              </h3>
              <p class="text-xs text-body-secondary mb-0 text-truncate">
                ${emergencyContacts[i].phone}
              </p>
            </div>
          </div>
          <a
            href="tel:${emergencyContacts[i].phone}"
            class="px-2 py-1 rounded-3 phoneEmergencyIcon ms-2"
          >
            <i class="fas fa-phone"></i>
          </a>
        </div>
      </div>
    `;
  }
  document.getElementById("emergencyRow").innerHTML = cartona;
}
// Color user icon
function getAvatarClass(name) {
  const firstLetter = name.charAt(0).toUpperCase();
  if ("ABC".includes(firstLetter)) return "avatar-blue";
  if ("DEF".includes(firstLetter)) return "avatar-green";
  if ("GHI".includes(firstLetter)) return "avatar-purple";
  if ("JKL".includes(firstLetter)) return "avatar-pink";
  if ("MNO".includes(firstLetter)) return "avatar-orange";
  if ("PQR".includes(firstLetter)) return "avatar-red";
  return "avatar-cyan";
}
