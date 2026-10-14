async (page) => {
  // Buscar todos los botones visibles en la página actual
  const buttons = await page.locator('button').all();
  const buttonInfo = [];

  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const ariaLabel = await button.getAttribute('aria-label');
    const text = await button.textContent();
    const className = await button.getAttribute('class');
    const isVisible = await button.isVisible();

    if (isVisible) {
      buttonInfo.push({
        index: i,
        ariaLabel,
        text: text?.trim(),
        className,
        isVisible
      });
    }
  }

  // También buscar elementos con role="button"
  const roleButtons = await page.locator('[role="button"]').all();
  const roleButtonInfo = [];

  for (let i = 0; i < roleButtons.length; i++) {
    const button = roleButtons[i];
    const ariaLabel = await button.getAttribute('aria-label');
    const text = await button.textContent();
    const className = await button.getAttribute('class');
    const isVisible = await button.isVisible();

    if (isVisible) {
      roleButtonInfo.push({
        index: i,
        ariaLabel,
        text: text?.trim(),
        className,
        isVisible
      });
    }
  }

  return {
    success: true,
    buttonCount: buttonInfo.length,
    buttons: buttonInfo,
    roleButtonCount: roleButtonInfo.length,
    roleButtons: roleButtonInfo
  };
}
