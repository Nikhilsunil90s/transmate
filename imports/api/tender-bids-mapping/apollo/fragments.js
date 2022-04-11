import gql from "graphql-tag";

const tenderBidMappingMapValuesWarnings = gql`
  fragment tenderBidMappingMapValuesWarnings on TenderBidMappingMapValuesWarnings {
    section
    originId
    description
  }
`;

const tenderBidMappingMapValues = gql`
  fragment tenderBidMappingMapValues on TenderBidMappingMapValues {
    lanes {
      colHeaders
      data {
        originId
        origin_lanesFromCountry
        target_lanesFromCountry
        origin_lanesToCountry
        target_lanesToCountry
        origin_lanesFromCity
        target_lanesFromCity
        origin_lanesFromLocode
        target_lanesFromLocode
        origin_lanesToCity
        target_lanesToCity
        origin_lanesToLocode
        target_lanesToLocode
        origin_lanesOriginService
        target_lanesOriginService
        origin_lanesDestinationService
        target_lanesDestinationService
        origin_lanesId
        target_lanesId
        origin_lanesToZip
        target_lanesToZip
        origin_lanesFromZip
        target_lanesFromZip
        origin_lanesFromRangeFrom
        target_lanesFromRangeFrom
        origin_lanesToRangeFrom
        target_lanesToRangeFrom
        origin_lanesFromSampleZipCodes
        target_lanesFromSampleZipCodes
        origin_lanesToSampleZipCodes
        target_lanesToSampleZipCodes
        averageLineDistance
        targetId
        validated
        skipInUBS
        warnings {
          ...tenderBidMappingMapValuesWarnings
        }
      }
    }
    charges {
      colHeaders
      data {
        originId
        origin_chargeDescription
        target_chargeDescription
        origin_chargeCurrency
        target_chargeCurrency
        origin_chargeMultiplier
        target_chargeMultiplier
        origin_chargeVolumeGroup
        target_chargeVolumeGroup
        targetId
        validated
        warnings {
          ...tenderBidMappingMapValuesWarnings
        }
      }
    }
    equipments {
      colHeaders
      data {
        originId
        origin_equipmentType
        target_equipmentType
        targetId
        validated
        warnings {
          ...tenderBidMappingMapValuesWarnings
        }
      }
    }
    volumes {
      colHeaders
      data {
        originId
        origin_volumeDescription
        origin_volumeRangeFrom
        origin_volumeRangeTo
        origin_volumeUOM
        target_volumeRangeFrom
        target_volumeRangeTo
        target_volumeDescription
        target_volumeUOM

        targetId
        validated
        warnings {
          ...tenderBidMappingMapValuesWarnings
        }
      }
    }
    none {
      colHeaders
      data {
        originId
        origin_keep
        target_keep
        origin_skip
        target_skip
        targetId
        validated
        warnings {
          ...tenderBidMappingMapValuesWarnings
        }
      }
    }
  }
  ${tenderBidMappingMapValuesWarnings}
`;

export const fragments = {
  tenderBidMappingMapValues,
  TenderBidMappingBase: gql`
    fragment TenderBidMappingBase on TenderBidMapping {
      id
      tenderBidId
      fileId
      fileType
      fileName
      name
      workbookFileUrl
      status {
        type
        processing
        dt
      }
      created {
        by
        at
      }

      header
      mappingH

      mappingV {
        ...tenderBidMappingMapValues
      }
      sections
      sheet
      sheets
      updated {
        by
        at
      }
    }
    ${tenderBidMappingMapValues}
  `
};
