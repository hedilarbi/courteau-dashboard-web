function validatehours(timeString) {
  if (timeString.length === 0) {
    return false;
  }
  const time = Number(timeString);
  if (!isNaN(time) && time >= 0 && time <= 23) {
    return true;
  } else {
    return false;
  }
}

function validatemins(timeString) {
  if (timeString.length === 0) {
    return false;
  }
  const time = Number(timeString);

  if (!isNaN(time) && time >= 0 && time <= 59) {
    return true;
  } else {
    return false;
  }
}

module.exports = { validatehours, validatemins };
