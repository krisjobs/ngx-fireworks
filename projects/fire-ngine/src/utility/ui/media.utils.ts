import { EntityFile, EntityLink, FileType, LinkType } from "functions/src/styleguide/models";

export function getFileType(file: EntityFile): FileType {
  let fileType: FileType;

  if (file.information.fileUrl.includes('.png?alt') || file.information.fileUrl.includes('.jpg?alt') || file.information.fileUrl.includes('.jpeg?alt')) {
    fileType = FileType.Image;
  } else if (file.information.fileUrl.includes('.xls?alt') || file.information.fileUrl.includes('.xlsx?alt')) {
    fileType = FileType.Excel;
  } else if (file.information.fileUrl.includes('.doc?alt') || file.information.fileUrl.includes('.docx?alt')) {
    fileType = FileType.Word;
  } else if (file.information.fileUrl.includes('.pdf?alt')) {
    fileType = FileType.PDF;
  } else {
    fileType = FileType.File;
  }

  return fileType;
}

export function getLinkType(link: EntityLink): LinkType {
  let linkType: LinkType;

  if (link.information.linkUrl.includes('youtube.com/')) {
    linkType = LinkType.YouTube;
  } else {
    linkType = LinkType.General;
  }

  return linkType;
}
