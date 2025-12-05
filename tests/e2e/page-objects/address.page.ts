import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object for Address-related modals and functionality
 * Used across the app in checkout, home page, etc.
 */
export class AddressPage extends BasePage {
  // Address modal
  readonly addressesModal: Locator;
  readonly addressSearchInput: Locator;
  readonly addressSearchResults: Locator;
  readonly savedAddresses: Locator;
  readonly manualEntryButton: Locator;
  readonly addressModalClose: Locator;

  // Address type modal
  readonly addressTypeModal: Locator;
  readonly houseOption: Locator;
  readonly apartmentOption: Locator;
  readonly businessOption: Locator;
  readonly otherOption: Locator;
  readonly addressTypeNextButton: Locator;

  // Address details modal
  readonly addressDetailsModal: Locator;
  readonly apartmentInput: Locator;
  readonly floorInput: Locator;
  readonly deliveryInstructionsInput: Locator;
  readonly leaveAtDoorOption: Locator;
  readonly meetAtLocationOption: Locator;
  readonly addressDetailsSaveButton: Locator;
  readonly personalLabelDropdown: Locator;

  // Add address modal (manual entry)
  readonly addAddressModal: Locator;
  readonly streetAddressInput: Locator;
  readonly apartmentSuiteInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly zipCodeInput: Locator;
  readonly continueButton: Locator;

  // Address label modal
  readonly labelModal: Locator;
  readonly homeLabel: Locator;
  readonly workLabel: Locator;
  readonly customLabelInput: Locator;
  readonly saveLabelButton: Locator;

  // Landing page address selector
  readonly landingAddressInput: Locator;
  readonly landingAddressSuggestions: Locator;

  constructor(page: Page) {
    super(page);

    // Address modal
    this.addressesModal = page.locator('[role="dialog"]:has-text("address")');
    this.addressSearchInput = this.addressesModal.locator('input[placeholder*="address" i], input[placeholder*="search" i]').first();
    this.addressSearchResults = this.addressesModal.locator('[class*="search-result"], div:has(p):has-text("Street")');
    this.savedAddresses = this.addressesModal.locator('[class*="saved-address"], div:has([class*="home" i]):has(p)');
    this.manualEntryButton = this.addressesModal.getByRole('button', { name: /manual|enter address/i });
    this.addressModalClose = this.addressesModal.locator('button:has([class*="x" i]), button[aria-label*="close" i]').first();

    // Address type modal
    this.addressTypeModal = page.locator('[role="dialog"]:has-text("type"), [role="dialog"]:has-text("House")');
    this.houseOption = this.addressTypeModal.locator('button:has-text("House"), div:has-text("House"):has(input[type="radio"])');
    this.apartmentOption = this.addressTypeModal.locator('button:has-text("Apartment"), div:has-text("Apartment"):has(input[type="radio"])');
    this.businessOption = this.addressTypeModal.locator('button:has-text("Business"), div:has-text("Business"):has(input[type="radio"])');
    this.otherOption = this.addressTypeModal.locator('button:has-text("Other"), div:has-text("Other"):has(input[type="radio"])');
    this.addressTypeNextButton = this.addressTypeModal.getByRole('button', { name: /next|continue/i });

    // Address details modal
    this.addressDetailsModal = page.locator('[role="dialog"]:has-text("details"), [role="dialog"]:has-text("instructions")');
    this.apartmentInput = this.addressDetailsModal.locator('input[name*="apt" i], input[placeholder*="apt" i]');
    this.floorInput = this.addressDetailsModal.locator('input[name*="floor" i], input[placeholder*="floor" i]');
    this.deliveryInstructionsInput = this.addressDetailsModal.locator('textarea, input[name*="instruction" i]');
    this.leaveAtDoorOption = this.addressDetailsModal.locator('button:has-text("Leave it"), div:has-text("Leave"):has(input[type="radio"])');
    this.meetAtLocationOption = this.addressDetailsModal.locator('button:has-text("Meet"), div:has-text("Meet"):has(input[type="radio"])');
    this.addressDetailsSaveButton = this.addressDetailsModal.getByRole('button', { name: /save|done|continue/i });
    this.personalLabelDropdown = this.addressDetailsModal.locator('select, [role="combobox"]');

    // Add address modal
    this.addAddressModal = page.locator('[role="dialog"]:has(input[name*="street" i]), [role="dialog"]:has-text("Enter address")');
    this.streetAddressInput = this.addAddressModal.locator('input[name*="street" i], input[placeholder*="street" i]').first();
    this.apartmentSuiteInput = this.addAddressModal.locator('input[name*="apt" i], input[placeholder*="apt" i]').first();
    this.cityInput = this.addAddressModal.locator('input[name*="city" i], input[placeholder*="city" i]').first();
    this.stateInput = this.addAddressModal.locator('input[name*="state" i], select[name*="state" i]').first();
    this.zipCodeInput = this.addAddressModal.locator('input[name*="zip" i], input[placeholder*="zip" i]').first();
    this.continueButton = this.addAddressModal.getByRole('button', { name: /continue|next|save/i });

    // Label modal
    this.labelModal = page.locator('[role="dialog"]:has-text("label")');
    this.homeLabel = this.labelModal.locator('button:has-text("Home"), div:has-text("Home"):has(input)');
    this.workLabel = this.labelModal.locator('button:has-text("Work"), div:has-text("Work"):has(input)');
    this.customLabelInput = this.labelModal.locator('input[placeholder*="custom" i], input[name*="label" i]');
    this.saveLabelButton = this.labelModal.getByRole('button', { name: /save|done/i });

    // Landing page address
    this.landingAddressInput = page.locator('input[placeholder*="delivery address" i], input[placeholder*="address" i]').first();
    this.landingAddressSuggestions = page.locator('[class*="suggestion"], [class*="autocomplete"] div');
  }

  /**
   * Search for an address in the addresses modal
   */
  async searchAddress(query: string) {
    await this.addressSearchInput.fill(query);
    await this.page.waitForTimeout(1000); // Wait for search results
  }

  /**
   * Select an address from search results
   */
  async selectSearchResult(index: number = 0) {
    await this.addressSearchResults.nth(index).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Select a saved address
   */
  async selectSavedAddress(index: number = 0) {
    await this.savedAddresses.nth(index).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Open manual address entry
   */
  async openManualEntry() {
    await this.manualEntryButton.click();
    await this.addAddressModal.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Fill in manual address form
   */
  async fillManualAddress(addressData: {
    street: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
  }) {
    await this.streetAddressInput.fill(addressData.street);
    if (addressData.apartment) {
      await this.apartmentSuiteInput.fill(addressData.apartment);
    }
    await this.cityInput.fill(addressData.city);
    await this.stateInput.fill(addressData.state);
    await this.zipCodeInput.fill(addressData.zipCode);
  }

  /**
   * Submit manual address form
   */
  async submitManualAddress() {
    await this.continueButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Select address type
   */
  async selectAddressType(type: 'house' | 'apartment' | 'business' | 'other') {
    const typeMap = {
      house: this.houseOption,
      apartment: this.apartmentOption,
      business: this.businessOption,
      other: this.otherOption,
    };
    await typeMap[type].click();
    await this.addressTypeNextButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Fill address details (apartment number, instructions, etc.)
   */
  async fillAddressDetails(details: {
    apartment?: string;
    floor?: string;
    instructions?: string;
    deliveryPreference?: 'leave' | 'meet';
  }) {
    if (details.apartment && await this.apartmentInput.isVisible()) {
      await this.apartmentInput.fill(details.apartment);
    }
    if (details.floor && await this.floorInput.isVisible()) {
      await this.floorInput.fill(details.floor);
    }
    if (details.instructions && await this.deliveryInstructionsInput.isVisible()) {
      await this.deliveryInstructionsInput.fill(details.instructions);
    }
    if (details.deliveryPreference) {
      const option = details.deliveryPreference === 'leave' ? this.leaveAtDoorOption : this.meetAtLocationOption;
      await option.click();
    }
  }

  /**
   * Save address details
   */
  async saveAddressDetails() {
    await this.addressDetailsSaveButton.click();
    await this.addressDetailsModal.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Set address label (Home, Work, custom)
   */
  async setAddressLabel(label: 'home' | 'work' | string) {
    if (label === 'home') {
      await this.homeLabel.click();
    } else if (label === 'work') {
      await this.workLabel.click();
    } else {
      await this.customLabelInput.fill(label);
    }
    await this.saveLabelButton.click();
    await this.labelModal.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Close addresses modal
   */
  async closeAddressesModal() {
    if (await this.addressesModal.isVisible()) {
      await this.addressModalClose.click();
      await this.addressesModal.waitFor({ state: 'hidden', timeout: 3000 });
    }
  }

  /**
   * Get count of saved addresses
   */
  async getSavedAddressCount(): Promise<number> {
    return await this.savedAddresses.count();
  }

  /**
   * Enter address on landing page
   */
  async enterAddressOnLanding(address: string) {
    await this.landingAddressInput.fill(address);
    await this.page.waitForTimeout(1000); // Wait for suggestions
  }

  /**
   * Select suggestion on landing page
   */
  async selectLandingSuggestion(index: number = 0) {
    await this.landingAddressSuggestions.nth(index).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Complete full address flow from search to save
   */
  async addNewAddress(addressData: {
    street: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    type?: 'house' | 'apartment' | 'business' | 'other';
    label?: string;
    instructions?: string;
  }) {
    await this.openManualEntry();
    await this.fillManualAddress(addressData);
    await this.submitManualAddress();

    // Handle address type modal if it appears
    if (await this.addressTypeModal.isVisible({ timeout: 2000 })) {
      await this.selectAddressType(addressData.type || 'house');
    }

    // Handle address details modal if it appears
    if (await this.addressDetailsModal.isVisible({ timeout: 2000 })) {
      await this.fillAddressDetails({
        apartment: addressData.apartment,
        instructions: addressData.instructions,
      });
      await this.saveAddressDetails();
    }

    // Handle label modal if it appears and label is provided
    if (addressData.label && await this.labelModal.isVisible({ timeout: 2000 })) {
      await this.setAddressLabel(addressData.label);
    }
  }
}



