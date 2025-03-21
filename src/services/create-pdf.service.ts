import { Inject, Injectable, Logger } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import type Handlebars from 'handlebars';
import { HANDLEBARS } from '../constants/handlebar.constants';

@Injectable()
export class CreatePdfService {
  private logger = new Logger(CreatePdfService.name);

  constructor(
    @Inject(HANDLEBARS)
    private readonly handlebars: typeof Handlebars,
  ) {}

  /**
   * render template with dir file
   * @param dir
   * @param data
   */
  renderTemplateComponent(dir: string, data?: Record<string, any>) {
    const templateFile = fs.readFileSync(path.resolve(__dirname, dir), 'utf-8');
    return this.handlebars.compile(templateFile)(data);
  }

  /**
   * render template
   * @param rawHtml
   * @param data
   */
  renderTemplate(rawHtml: string, data?: Record<string, any>) {
    return this.handlebars.compile(rawHtml)(data);
  }

  /**
   * The function "render" reads a template file, resolves its path, and then renders the template with the provided data.
   * @param {any} data - The `data` parameter is an object that contains the data that will be used to populate the
   * template. It can be any type of data, such as an object, array, or string.
   * @param {string} template - The `template` parameter is a string that represents the path to a template file.
   * @returns the result of calling the `renderTemplate` function with the `templateFile` and `data` as arguments.
   */
  renderTemplateGeneral(data: any, template: string) {
    const templateFile = fs.readFileSync(path.resolve(__dirname, template), 'utf-8');

    return this.renderTemplate(templateFile, data);
  }
}
