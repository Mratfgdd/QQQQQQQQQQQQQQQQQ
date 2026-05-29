import React from "react";
import { Row, Col, InfoItem } from "./style";
import { useTranslation } from "react-i18next";

export default function HomeInfo() {
  const { t } = useTranslation();
  return (
    <Row>
      <Col>
        <InfoItem>
          
        </InfoItem>
      </Col>
      <Col>
        <InfoItem>
          
        </InfoItem>
      </Col>
      <Col>
        <InfoItem>

        </InfoItem>
      </Col>
    </Row>
  );
}
