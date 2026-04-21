export function getCurrentPage() {
  const page = document.body.dataset.page;
  return page || "home";
}

export function goToProfile() {
  window.location.href = "./profile.html";
}
