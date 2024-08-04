import type { Meta, StoryObj } from '@storybook/angular';

import { FooterComponent } from './footer.component';

const meta: Meta<FooterComponent> = {
  title: 'Example/Footer',
  component: FooterComponent,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  args: {
  },
};

export default meta;
type Story = StoryObj<FooterComponent>;

export const LoggedIn: Story = {
  args: {
    // user: {
    //   name: 'Jane Doe',
    // }
  },
};

export const LoggedOut: Story = {};
