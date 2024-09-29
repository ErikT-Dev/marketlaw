import { Text } from 'react-native';

interface StatTextProps {
    stat: string
    text: string
}

export default function StatText({ stat, text }: StatTextProps) {
    return (
        <>
            {stat === 'cardTitle' &&
                <Text style={{ color: '#29231e' }}>{text}</Text>
            }
            {stat === 'basic' &&
                <Text style={{ color: '#f7ecc8' }}>{text}</Text>
            }
            {stat === 'tier' &&
                <Text style={{ color: '#1d2033' }}>{text}</Text>
            }
            {stat === 'cost' &&
                <Text style={{ color: '#fa142b' }}>{text}</Text>
            }
            {stat === 'influence' &&
                <Text style={{ color: '#d5edf2' }}>{text}</Text>
            }
            {stat === 'workforce' &&
                <Text style={{ color: '#0a6300' }}>{text}</Text>
            }
            {stat === 'quality' &&
                <Text style={{ color: '#b82576' }}>{text}</Text>
            }
            {stat === 'satisfaction' &&
                <Text style={{ color: '#5d2a9c' }}>{text}</Text>
            }
            {stat === 'product' &&
                <Text style={{ color: '#ad1400' }}>{text}</Text>
            }
            {stat === 'sales' &&
                <Text style={{ color: '#856a00' }}>{text}</Text>
            }
        </>
    );
}
