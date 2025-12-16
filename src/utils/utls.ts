import camelCase from 'camelcase';
import { DOMParser } from 'xmldom';

type AnyObject = Record<string, unknown>;

// API호출시 넘어오는 대문자 키값을 카멜케이스로 바꿔주는 함수
export function keysToCamelCase(input: AnyObject | unknown[]): AnyObject | unknown[] {
  if (Array.isArray(input)) {
    return input.map((item) => (typeof item === 'object' && item !== null ? keysToCamelCase(item as AnyObject) : item));
  }

  if (typeof input !== 'object' || input === null) {
    return input;
  }

  return Object.entries(input).reduce<AnyObject>((acc, [key, value]) => {
    const camelKey = camelCase(key);

    acc[camelKey] = typeof value === 'object' && value !== null ? keysToCamelCase(value as AnyObject) : value;

    return acc;
  }, {});
}

// 로그인시 사용자조회 API로 넘어오는 xml데이터 파싱 함수
export async function parseXml(res: Response) {
  const contentType = res.headers.get('Content-Type');

  if (contentType && contentType.includes('application/xml')) {
    const xmlText = await res.text();

    // XML → JSON
    const jsonData = simpleXMLToJSON(xmlText);
    return jsonData; // Response.json ❌ → 순수 JSON 반환 ⭕
  }

  if (contentType && contentType.includes('application/json')) {
    const jsonData = await res.json();
    return jsonData; // Response.json ❌ → JSON만 반환 ⭕
  }

  const text = await res.text();

  return {
    error: 'Unexpected response format',
    response: text,
  };
}

// 심플하게 XML 데이터를 JSON으로 변환하는 함수
function simpleXMLToJSON(xmlString: string): Record<string, any> {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml'); // XML 파싱

  // 루트 노드 가져오기
  const root = xmlDoc.documentElement;

  // 루트 노드를 JSON으로 변환
  return elementToJSON(root);
}

// 개별 XML 노드를 JSON으로 변환
function elementToJSON(element: Element): any {
  const obj: Record<string, any> = {};

  // 속성 변환 (XML 속성을 처리. 예: <tag attr="value">)
  if (element.attributes.length > 0) {
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      obj[`@${attr.name}`] = attr.value; // 속성명은 "@"로 시작
    }
  }

  // 자식 노드 변환
  if (element.childNodes.length > 0) {
    for (let i = 0; i < element.childNodes.length; i++) {
      const child = element.childNodes[i];

      // 텍스트 노드인 경우 처리
      if (child.nodeType === 3) {
        const textContent = child.nodeValue?.trim(); // 텍스트 공백 제거
        if (textContent !== undefined) {
          // 빈 문자열 포함하여 항상 반환
          return textContent === '' ? '' : textContent;
        }
      }

      // 요소인 경우 (다른 XML 태그)
      if (child.nodeType === 1) {
        const childElement = child as Element;
        const childName = childElement.nodeName;
        const childJSON = elementToJSON(childElement);

        // 동일 태그가 여러 개일 경우 배열 처리
        if (obj[childName]) {
          if (!Array.isArray(obj[childName])) {
            obj[childName] = [obj[childName]];
          }
          obj[childName].push(childJSON);
        } else {
          obj[childName] = childJSON;
        }
      }
    }
  } else {
    // 자식 노드가 없으면 빈 문자열로 설정
    return '';
  }

  return obj;
}
